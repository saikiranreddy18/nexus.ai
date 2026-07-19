import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth cookie on every request. Server Components
 * can't write cookies themselves, so without this the session cookie set by
 * the browser client would never get validated/refreshed on the server —
 * this is the standard Supabase pattern for the Next.js App Router, renamed
 * from `middleware.ts` to `proxy.ts` in Next.js 16.
 */
export function proxy(request: NextRequest) {
  return refreshSession(request);
}

async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const configured =
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("[") &&
    !supabaseAnonKey.includes("[");

  if (!configured) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touching auth here is what actually validates/refreshes the cookie.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
