import { Globe, ArrowRight, Instagram, Twitter } from "lucide-react";
import ElectronicsBackground from "./ElectronicsBackground";

function App() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Full-screen animated electronics / circuit-board background */}
      <ElectronicsBackground />

      {/* Foreground: full-screen flex column */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation */}
        <nav className="relative z-20 pl-6 pr-6 py-6">
          <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Globe size={24} className="text-white" />
                <span className="text-white font-semibold text-lg">Asme</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  About
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-white text-sm font-medium">Sign Up</button>
              <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">
                Login
              </button>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Built for the curious
          </h1>

          <div className="max-w-xl w-full space-y-4">
            {/* Email input bar */}
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent outline-none border-none text-white placeholder:text-white/40 text-base"
              />
              <button
                aria-label="Submit"
                className="bg-white rounded-full p-3 text-black"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-white text-sm leading-relaxed px-4">
              Stay updated with the latest news and insights. Subscribe to our
              newsletter today and never miss out on exciting updates.
            </p>

            {/* Manifesto button */}
            <div className="flex justify-center">
              <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                Read our manifesto
              </button>
            </div>
          </div>
        </div>

        {/* Social icons footer */}
        <div className="relative z-10 flex justify-center gap-4 pb-12">
          <button
            aria-label="Instagram"
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <Instagram size={20} />
          </button>
          <button
            aria-label="Twitter"
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <Twitter size={20} />
          </button>
          <button
            aria-label="Website"
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <Globe size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
