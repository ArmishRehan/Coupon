/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#19183B",      // Primary Dark (Navy/Indigo)
          accent: "#708993",    // Accent Gray-Blue
          soft: "#A1C2BD",      // Soft Mint-Gray
          light: "#E7F2EF",     // Background Light
        },
      },
    },
  },
  plugins: [],
};
