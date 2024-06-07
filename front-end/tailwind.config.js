/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'black-squeeze': {
          '50': '#f3fcff',
          '100': '#e0f7fe',
          '200': '#baf0fd',
          '300': '#7de6fc',
          '400': '#38daf8',
          '500': '#0ec6e9',
          '600': '#02a2c7',
          '700': '#0381a1',
          '800': '#076c85',
          '900': '#0c596e',
          '950': '#083949',
      },  
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
        },'jordy-blue': {
          '50': '#f1f6fd',
          '100': '#e0ecf9',
          '200': '#c8def5',
          '300': '#a3c9ed',
          '400': '#80b1e5',
          '500': '#578eda',
          '600': '#4273ce',
          '700': '#3960bc',
          '800': '#344f99',
          '900': '#2e457a',
          '950': '#202c4b',
      },
      

      },
    },
  },
  plugins: [require("daisyui")],
};
