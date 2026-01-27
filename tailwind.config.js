/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colors matching your UI design specs
        canvas: "#1e1e1e",
        panel: "#252526",
        node: "#333333",
        accent: "#007acc",
      },
    },
  },
  plugins: [],
}