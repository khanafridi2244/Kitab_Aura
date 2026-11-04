import { Link } from "react-router-dom";
import Logo from "./Logo";

const YEAR = new Date().getFullYear();

// These come from frontend/.env. A link only appears when its value is set, so no dead links
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
const SOCIALS = [
  { label: "Facebook", url: import.meta.env.VITE_FACEBOOK_URL },
  { label: "Instagram", url: import.meta.env.VITE_INSTAGRAM_URL },
  { label: "YouTube", url: import.meta.env.VITE_YOUTUBE_URL },
].filter((s) => s.url);

const linkClass = "text-sm text-white/75 transition hover:text-white hover:underline";

function Column({ title, children }) {
  return (
    <div>
      <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-accent">{title}</h2>
      <ul className="mt-4 space-y-2">{children}</ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="footer-bg text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm font-medium italic text-accent">Where Every Book Has a Story.</p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            KitabAura is a multilingual digital library for readers of Pashto, Urdu and English.
          </p>
        </div>

        <Column title="Explore">
          <li><Link to="/" className={linkClass}>Home</Link></li>
          <li><Link to="/browse" className={linkClass}>Explore Books</Link></li>
          <li><Link to="/popular" className={linkClass}>Popular Books</Link></li>
          <li><Link to="/#categories" className={linkClass}>Categories</Link></li>
          <li><Link to="/browse?language=pashto" className={linkClass}>Pashto books</Link></li>
          <li><Link to="/browse?language=urdu" className={linkClass}>Urdu books</Link></li>
          <li><Link to="/browse?language=english" className={linkClass}>English books</Link></li>
        </Column>

        <Column title="Information">
          <li><Link to="/#about" className={linkClass}>About KitabAura</Link></li>
          <li><Link to="/#faq" className={linkClass}>FAQ</Link></li>
          {CONTACT_EMAIL && (
            <li><a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>Contact us</a></li>
          )}
        </Column>

        <Column title="Community">
          <li><Link to="/blog" className={linkClass}>Blog</Link></li>
          <li><Link to="/requests" className={linkClass}>Request a book</Link></li>
          <li><Link to="/upload" className={linkClass}>Share a book</Link></li>
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {s.label}
              </a>
            </li>
          ))}
        </Column>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/60">
          &copy; {YEAR} KitabAura. All rights reserved.
        </p>
      </div>
    </footer>
  );
}