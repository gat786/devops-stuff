/** @type {import('tailwindcss').Config} */
import tailwindTypography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{html,js,ts,svelte}"],
  theme: {
    extend: {},
  },
  plugins: [tailwindTypography],
  darkMode: "selector",
};
