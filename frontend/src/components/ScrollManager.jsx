import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the top on a new page, or to the section named in the address (like /#faq)
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // A short wait lets the target section render first
    const timer = setTimeout(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}