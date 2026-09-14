/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#0a0612",
          panel: "#150f22",
          border: "#2b2140",
          accent: "#a855f7",
          accentbright: "#d8b4fe",
          text: "#f3eefc",
          muted: "#a79bc4",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        gothic: ["var(--font-gothic)", "serif"],
      },
      backgroundImage: {
        "vault-radial":
          "radial-gradient(circle at 50% -10%, rgba(168,85,247,0.20), transparent 60%)",
      },
    },
  },
  plugins: [],
};
