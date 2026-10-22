import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
  }`;

export default function Navbar() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile menu
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
    navigate("/");
  };

  // The same links are used in the desktop bar and the mobile menu
  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
      <NavLink to="/browse" className={linkClass} onClick={close}>Browse</NavLink>
      {isAuthenticated && (
        <NavLink to="/upload" className={linkClass} onClick={close}>Upload</NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={linkClass} onClick={close}>Dashboard</NavLink>
      )}
    </>
  );

  const authArea = loading ? null : isAuthenticated ? (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/90">Hi, {user.name.split(" ")[0]}</span>
      <button
        onClick={handleLogout}
        className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/25"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link to="/login" onClick={close} className="px-3 py-1.5 text-sm font-medium text-white hover:underline">
        Login
      </Link>
      <Link
        to="/register"
        onClick={close}
        className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Sign up
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-primary shadow">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-white">
          Kitab<span className="text-accent">Aura</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        <div className="hidden md:block">{authArea}</div>

        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="space-y-3 border-t border-white/10 px-4 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">{links}</nav>
          {authArea}
        </div>
      )}
    </header>
  );
}