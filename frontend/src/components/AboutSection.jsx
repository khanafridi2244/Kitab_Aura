import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const POINTS = [
  "Books in Pashto, Urdu and English",
  "Read online or download as PDF with a free account",
  "Share a book, or request one you cannot find",
];

export default function AboutSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section id="about" aria-labelledby="about-heading" className="about-bg relative text-white">
      {/* Curved edge from the page colour */}
      <svg className="absolute inset-x-0 -top-px h-8 w-full rotate-180" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 C240 90 480 0 720 30 C960 60 1200 90 1440 30 L1440 80 L0 80 Z" style={{ fill: "var(--page)" }} />
      </svg>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-5">
        <div className="md:col-span-2" aria-hidden="true">
          <svg viewBox="0 0 260 220" className="mx-auto w-full max-w-xs" role="presentation">
            <ellipse cx="130" cy="202" rx="105" ry="9" fill="rgba(0,0,0,0.3)" />
            <rect x="35" y="150" width="190" height="32" rx="5" fill="#d9a441" />
            <rect x="50" y="116" width="165" height="32" rx="5" fill="#f3e6c8" />
            <rect x="28" y="82" width="180" height="32" rx="5" fill="#2f7d69" />
            <rect x="55" y="52" width="150" height="28" rx="5" fill="#c99a3b" />
            <path d="M60 166h120M72 132h90M44 98h110M72 66h80" stroke="#0b2e23" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <div className="md:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">About KitabAura</p>
          <h2 id="about-heading" className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            A World of Stories, in Your Language.
          </h2>
          <p className="mt-4 max-w-xl text-white/85">
            KitabAura brings readers closer to books and ideas across Pashto, Urdu, and English. Discover literature,
            learn from new perspectives, and make reading part of everyday life.
          </p>

          <ul className="mt-5 space-y-2">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/90">
                <span className="mt-0.5 text-accent" aria-hidden="true">&#10003;</span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/browse" className="rounded-full bg-[#f3e6c8] px-6 py-2.5 text-sm font-semibold text-[#14201a] hover:bg-[#ead9b0]">
              Explore Books
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                Create a free account
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}