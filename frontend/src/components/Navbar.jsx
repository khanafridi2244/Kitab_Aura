import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

// About and FAQ are sections on the home page (added in the next batch)
const NAV = [
  { label: "Home", to: "/", isActive: (p, h) => p === "/" && !h },
  { label: "Explore Books", to: "/browse", isActive: (p) => p.startsWith("/browse") || p.startsWith("/books") },
  { label: "Popular", to: "/popular", isActive: (p) => p.startsWith("/popular") },
  { label: "Categories", to: "/#categories", isActive: (p, h) => p === "/" && h === "#categories" },
  { label: "About", to: "/#about", isActive: (p, h) => p === "/" && h === "#about" },
  { label: "FAQ", to: "/#faq", isActive: (p, h) => p === "/" && h === "#faq" },
  { label: "Blog", to: "/blog", isActive: (p) => p.startsWith("/blog") },
];

const USER_LINKS = [
  { to: "/profile", label: "Profile" },
  { to: "/library", label: "My library" },
  { to: "/favorites", label: "Favorites" },
  { to: "/challenges", label: "Challenges" },
  { to: "/upload", label: "Upload a book" },
  { to: "/my-uploads", label: "My uploads" },
  { to: "/requests", label: "Request a book" },
];

const pill = "rounded-full px-4 py-1.5 text-sm font-semibold transition";

function SearchLink() {
  return (
    <Link
      to="/browse"
      aria-label="Search books"
      title="Search books"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    </Link>
  );
}

export default function Navbar() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const { pathname, hash, key } = useLocation();
  const navigate = useNavigate();
  const userRef = useRef(null);

  // Menus remember the page they were opened on, so they close by themselves when the page changes
  const [menuKey, setMenuKey] = useState(null);
  const [userKey, setUserKey] = useState(null);
  const menuOpen = menuKey === key;
  const userOpen = userKey === key;

  // Close the account menu with Escape or a click outside it
  useEffect(() => {
    if (!userOpen) return;
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserKey(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setUserKey(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuKey(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeAll = () => {
    setMenuKey(null);
    setUserKey(null);
  };

  const handleLogout = async () => {
    await logout();
    closeAll();
    navigate("/");
  };

  const firstName = user?.name?.trim().split(" ")[0] || "";
  const initial = firstName.charAt(0).toUpperCase();

  const navLinkClass = (active) =>
    `border-b-2 py-1 text-sm font-medium transition ${
      active ? "border-accent text-white" : "border-transparent text-white/80 hover:text-white"
    }`;

  const mobileLinkClass = (active) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b2e23]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
          {NAV.map((item) => {
            const active = item.isActive(pathname, hash);
            return (
              <Link key={item.to} to={item.to} aria-current={active ? "page" : undefined} className={navLinkClass(active)}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 xl:flex">
          <SearchLink />
          <ThemeToggle />

          {loading ? null : isAuthenticated ? (
            <div ref={userRef} className="relative">
              <button
                type="button"
                onClick={() => setUserKey(userOpen ? null : key)}
                aria-expanded={userOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm font-medium text-white hover:bg-white/20"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">
                  {initial}
                </span>
                <span className="max-w-28 truncate">{firstName}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {userOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-surface py-2 text-ink shadow-xl">
                  {USER_LINKS.map((l) => (
                    <Link key={l.to} to={l.to} className="block px-4 py-2 text-sm hover:bg-soft">
                      {l.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm font-semibold text-primary hover:bg-soft">
                      Admin dashboard
                    </Link>
                  )}
                  <div className="my-2 border-t border-line" />
                  <button type="button" onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm hover:bg-soft">
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={`${pill} border border-white/30 text-white hover:bg-white/10`}>
                Login
              </Link>
              <Link to="/register" className={`${pill} bg-[#f3e6c8] text-[#14201a] hover:bg-[#ead9b0]`}>
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions: search and theme stay reachable */}
        <div className="flex items-center gap-1 xl:hidden">
          <SearchLink />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuKey(menuOpen ? null : key)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 px-4 pb-5 pt-3 xl:hidden">
          <nav aria-label="Main" className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.isActive(pathname, hash);
              return (
                <Link key={item.to} to={item.to} onClick={closeAll} aria-current={active ? "page" : undefined} className={mobileLinkClass(active)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            {loading ? null : isAuthenticated ? (
              <>
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-accent">Hi, {firstName}</p>
                <div className="flex flex-col gap-1">
                  {USER_LINKS.map((l) => (
                    <Link key={l.to} to={l.to} onClick={closeAll} className={mobileLinkClass(pathname === l.to)}>
                      {l.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link to="/admin" onClick={closeAll} className={mobileLinkClass(pathname.startsWith("/admin"))}>
                      Admin dashboard
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-white/85 hover:bg-white/10">
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={closeAll} className={`${pill} flex-1 border border-white/30 text-center text-white hover:bg-white/10`}>
                  Login
                </Link>
                <Link to="/register" onClick={closeAll} className={`${pill} flex-1 bg-[#f3e6c8] text-center text-[#14201a] hover:bg-[#ead9b0]`}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}