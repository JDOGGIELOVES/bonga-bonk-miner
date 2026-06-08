import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bonga: {
          orange: "#FF6200",
          "orange-soft": "#FF8533",
          teal: "#2DB8A8",
          purple: "#8B5CF6",
          green: "#4ADE80",
          cream: "#FAFAF8",
          sand: "#F5F3EF",
          charcoal: "#1A1A1F",
          brown: "#6B4226",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        bonga: "1rem",
        "bonga-lg": "1.25rem",
      },
      boxShadow: {
        bonga: "0 4px 24px -4px rgba(255, 98, 0, 0.12)",
        "bonga-lg": "0 8px 40px -8px rgba(255, 98, 0, 0.15)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "bonga-gradient": "linear-gradient(135deg, #FF6200 0%, #FF8533 100%)",
        "bonga-subtle":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,98,0,0.08), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(45,184,168,0.06), transparent), radial-gradient(ellipse 50% 30% at 0% 80%, rgba(139,92,246,0.05), transparent)",
        "bonga-mesh":
          "linear-gradient(180deg, #FAFAF8 0%, #F5F3EF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;