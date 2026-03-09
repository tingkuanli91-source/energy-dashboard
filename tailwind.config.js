/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00f2ff',
        'neon-green': '#39ff14',
        'deep-bg': '#0a0e14',
        'panel-bg': '#161b22',
      },
    },
  },
  plugins: [],
}
