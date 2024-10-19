/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px', // Define un nuevo punto de quiebre más pequeño que 'sm'
      },
      fontSize: {
        // Define un nuevo tamaño de fuente personalizado
        'md': '1rem', // 18px, por ejemplo
      },
    },
  },
  plugins: [],
}

