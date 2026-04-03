/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2C3E50",
        "primary-dark": "#1A252F",
        "primary-light": "#34495E",
        secondary: "#1899A3",
        "secondary-dark": "#117A85",
        "secondary-light": "#2BA8B5",
        accent: "#6C63FF",
        "accent-dark": "#5A52E0",
        success: "#27AE60",
        error: "#E74C3C",
        warning: "#E67E22",
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
          950: "#030712",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"Fira Code"',
          '"Cascadia Code"',
          '"Courier New"',
          "monospace",
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
        base: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
        md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        "2xl": "0 25px 50px -12px rgba(0,0,0,0.25)",
        glow: "0 0 20px rgba(24,153,163,0.35)",
        "glow-lg": "0 0 40px rgba(24,153,163,0.25)",
        "inner-glow": "inset 0 0 20px rgba(24,153,163,0.1)",
      },
      borderRadius: {
        sm: "0.375rem",
        base: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      backgroundImage: {
        "gradient-studio":
          "linear-gradient(135deg, #2C3E50 0%, #1899A3 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #1A252F 0%, #2C3E50 40%, #117A85 100%)",
        "gradient-card":
          "linear-gradient(135deg, #1899A3 0%, #2BA8B5 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #6C63FF 0%, #1899A3 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #0F1117 0%, #1A1F2E 100%)",
      },
      transitionTimingFunction: {
        studio: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "20px",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
