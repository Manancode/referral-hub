/** @type {import('tailwindcss').Config} */
export const content = [
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  './app/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
  extend: {},
};
export const plugins = [require('daisyui')];
export const corePlugins = {
  preflight: false, // This prevents Tailwind from resetting Mantine's styles
};