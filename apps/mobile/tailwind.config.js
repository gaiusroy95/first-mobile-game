/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0b1210",
        surface: "#15201b",
        "surface-raised": "#1c2a23",
        primary: "#c45c26",
        accent: "#d4a84b",
        ink: "#eef2ea",
        muted: "#8a9688",
        danger: "#c43c3c",
        success: "#3d9a6a",
        border: "#2a3a32",
      },
    },
  },
  plugins: [],
};
