# NEXUS AI — Landing Page

3D immersive landing page for NEXUS AI, a role-aware AI command center. Built with React 19, React Three Fiber, Framer Motion, and Tailwind CSS 4 on Vite.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## What's inside

- **3D universe** — persistent WebGL scene ([src/components/3d/Scene.jsx](src/components/3d/Scene.jsx)): star field + nebulae, six clickable "tool planets" (Code, Design, Writing, Data, Automation, Learning), a crystalline central hub, and a scroll-driven camera that travels between section waypoints ([CameraController.jsx](src/components/3d/CameraController.jsx)). The scene dims while reading content and returns to full brightness at the hero and final CTA. CSS-gradient fallback when WebGL is unavailable; particle counts and motion are reduced on mobile and for `prefers-reduced-motion`.
- **Sections** — Hero, How It Works (journey map), For Students, Pricing (Student $3 / Pro $8 / Team $30 with "Compare all" table), Features, Testimonials (auto-rotating), Final CTA + footer.
- **Onboarding quiz** — 5-question portal overlay ([QuizPortal.jsx](src/components/ui/QuizPortal.jsx)) that generates a persona ([personaGenerator.js](src/utils/personaGenerator.js)), a 3-tool starter stack, and a suggested plan.
- **Analytics** — every meaningful interaction tracked ([analyticsEvents.js](src/utils/analyticsEvents.js)): `page_view`, `section_view`, `cta_click`, `quiz_start/answer/complete`, `plan_hover`, `plan_select`, `planet_click`, `time_on_page`. Events go to GA4 when configured, and to `window.dataLayer` + dev console otherwise.

## Analytics setup

Copy `.env.example` to `.env` and set:

```
VITE_GA4_ID=G-XXXXXXXXXX
```

On Vercel, add `VITE_GA4_ID` as an environment variable. Hotjar/Clarity/Mixpanel can be layered in via `initAnalytics()` in the same file.

## Rebranding

The brand name lives in one place: [src/config.js](src/config.js). Change `BRAND` there (e.g. to `EXUS AI`) and it updates the nav, hero, and footer.

## Deploy

Static Vite build — deploys to Vercel/Netlify with zero config (`npm run build`, serve `dist/`).
