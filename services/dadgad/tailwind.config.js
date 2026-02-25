/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "dadgad-light":
          "linear-gradient(135deg, #fefce8 0%, #fef3c7 40%, #fbcfe8 100%)",
        "dadgad-dark":
          "linear-gradient(135deg, #020617 0%, #0f172a 45%, #4c1d95 100%)",
      },
    },
  },
  plugins: [],
}
