/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#172235",
          light: "#253650",
          soft: "#34445d",
        },
        paper: {
          DEFAULT: "#ffffff",
          dim: "#f2f5fa",
        },
        brass: {
          DEFAULT: "#f04452",
          light: "#ff6570",
          dark: "#ce2e3d",
        },
        circuit: {
          DEFAULT: "#2764d8",
          light: "#4d83ed",
          dark: "#1749ad",
        },
        grade: {
          a: "#3D8B5F",
          b: "#C98A3B",
          c: "#B4552F",
        },
      },
      fontFamily: {
        display: ["'Montserrat'", "sans-serif"],
        body: ["'Roboto'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,21,28,0.06), 0 8px 24px rgba(18,21,28,0.08)",
        stamp: "0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px currentColor",
      },
      borderRadius: {
        xs: "4px",
      },
    },
  },
  plugins: [],
};
