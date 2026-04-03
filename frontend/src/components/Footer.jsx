import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="transition-colors duration-200 mt-auto"
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#1899A3,#117A85)" }}>
                <span className="text-white text-sm">📚</span>
              </div>
              <span className="font-extrabold text-sm" style={{ color: "var(--color-text-dark)" }}>
                E-Learning<span style={{ color: "var(--color-secondary)" }}>Pro</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Professional online learning for developers, designers, and data scientists.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-text-muted)" }}>Quick Links</p>
            <ul className="space-y-2">
              {[
                { to: "/",          label: "Explore Courses" },
                { to: "/login",     label: "Login" },
                { to: "/signup",    label: "Sign Up" },
                { to: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-xs transition-colors"
                    style={{ color: "var(--color-text-light)", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--color-secondary)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--color-text-light)")}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-text-muted)" }}>Features</p>
            <ul className="space-y-2">
              {[
                "Expert-crafted content",
                "Self-paced learning",
                "Progress tracking",
                "Dark & Light modes",
              ].map((item) => (
                <li key={item} className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-text-light)" }}>
                  <span style={{ color: "var(--color-secondary)" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 text-xs"
          style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <span>© {year} E-Learning Platform. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with{" "}
            <span style={{ color: "#E74C3C" }}>♥</span>
            {" "}for learners worldwide
          </span>
        </div>
      </div>
    </footer>
  );
}
