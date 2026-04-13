/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          light: '#dcf8c6',
          dark: '#075e54',
          green: '#25d366',
          teal: '#128c7e'
        }
      }
    }
  },
  plugins: []
};
