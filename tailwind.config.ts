import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        peacock: {
          DEFAULT: '#003C5E',
          50: '#e6f4fb',
          100: '#b8e3f6',
          500: '#0070aa',
          800: '#003C5E',
          900: '#00253b',
        },
        emeraldClub: {
          DEFAULT: '#007F6E',
          50: '#e6f7f4',
          100: '#b8ebe3',
          500: '#007F6E',
          800: '#005247',
        },
        golden: {
          DEFAULT: '#FFB703',
          400: '#ffc833',
          500: '#FFB703',
          600: '#cc9200',
        },
        sunset: {
          DEFAULT: '#E85D04',
          500: '#E85D04',
          600: '#ba4a03',
        },
        midnight: '#0D0D0F',
        surfaceDark: '#15171A',
        cardDark: '#1A1D22',
        ivory: '#F8F7F2',
      },
    },
  },
  plugins: [],
};
export default config;
