/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
       
        "black-squeeze": "#f3fcff",
        "picton-blue": {
          50: "#effaff",
          100: "#def3ff",
          200: "#b6eaff",
          300: "#75dbff",
          400: "#2ccaff",
          500: "#00aeef",
          600: "#0090d4",
          700: "#0073ab",
          800: "#00608d",
          900: "#065074",
          950: "#04334d",
        },
        "persian-green": {
          50: "#effefb",
          100: "#c7fff5",
          200: "#90ffeb",
          300: "#51f7e0",
          400: "#1de4cf",
          500: "#04c8b6",
          600: "#00a99d",
          700: "#058078",
          800: "#0a6561",
          900: "#0d5450",
          950: "#003333",
        },
      },
    },
  },
  plugins: [require("daisyui")],
};
