import { Link } from "react-router-dom";

// For dark green backgrounds (navbar and footer)
export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="KitabAura home">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d9a441" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.5C10.3 5.2 8 4.7 5 4.7v12.6c3 0 5.3.5 7 1.8 1.7-1.3 4-1.8 7-1.8V4.7c-3 0-5.3.5-7 1.8z" />
        <path d="M12 6.5v12.6" />
      </svg>
      <span className="font-display text-xl font-semibold leading-none text-white">
        Kitab<span className="text-accent">Aura</span>
      </span>
    </Link>
  );
}