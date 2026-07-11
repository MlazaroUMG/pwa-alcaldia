import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "muni-green": "#97d700",
        "muni-blue": "#1700a5",
        "muni-red": "#e14647",
        "muni-lightblue": "#72c5e4",
      },
    },
  },
}

export default config
