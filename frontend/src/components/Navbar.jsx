import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    if (token) {
      api.get("/auth/me").then((res) => setUser(res.data)).catch(() => setUser(null));
    }
  }, [token]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 dark:bg-[#0B0F1A]/90 backdrop-blur-md shadow-md border-b border-[var(--color-border)]"
          : "bg-white dark:bg-[#0B0F1A] border-b border-[var(--color-border)]",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          style={{ textDecoration: "none" }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-secondary to-secondary-dark shadow-sm">
            <span className="text-white text-base leading-none">📚</span>
          </div>
          <span
            className="text-[1.05rem] font-extrabold tracking-tight"
            style={{ color: "var(--color-text-dark)" }}
          >
            E-Learning
          </span>
          <span
            className="hidden sm:inline text-[1.05rem] font-extrabold tracking-tight"
            style={{ color: "var(--color-secondary)" }}
          >
            Pro
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {!token ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary text-sm px-4 py-2 ml-1">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Explore</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-base text-sm font-semibold transition-all"
                  style={{ background: "rgba(230,126,34,0.1)", color: "#E67E22", border: "1px solid rgba(230,126,34,0.25)" }}
                >
                  ⚙️ Admin
                </Link>
              )}
              {user?.name && (
                <span className="text-sm font-medium px-3" style={{ color: "var(--color-text-muted)" }}>
                  {user.name}
                </span>
              )}
              <button onClick={handleLogout} className="btn btn-danger text-sm px-4 py-2">
                Logout
              </button>
            </>
          )}

          {/* Theme toggle */}
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-base transition-colors"
            style={{ color: "var(--color-text-light)" }}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sm:hidden border-t animate-slideInUp px-5 py-4 space-y-2"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {!token ? (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-nav-link">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn btn-primary w-full text-sm py-2.5">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-nav-link">Explore</Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-nav-link">Dashboard</Link>
              {user?.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="mobile-nav-link">⚙️ Admin</Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger w-full text-sm py-2.5">
                Logout
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-link {
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-light);
          transition: all 0.15s;
          text-decoration: none;
        }
        .nav-link:hover {
          color: var(--color-secondary);
          background: rgba(24,153,163,0.07);
          text-decoration: none;
        }
        .mobile-nav-link {
          display: block;
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-light);
          transition: all 0.15s;
          text-decoration: none;
        }
        .mobile-nav-link:hover {
          color: var(--color-secondary);
          background: rgba(24,153,163,0.07);
          text-decoration: none;
        }
      `}</style>
    </nav>
  );
}

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative p-2 rounded-base transition-all duration-200 focus:outline-none"
      style={{
        color: "var(--color-text-muted)",
        background: "var(--color-surface-alt)",
        border: "1px solid var(--color-border)",
      }}
    >
      <span className="block w-5 h-5">
        {isDark ? (
          /* Sun icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          /* Moon icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </span>
    </button>
  );
}
