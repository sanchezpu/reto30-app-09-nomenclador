/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Consola de operaciones: grafito azulado + ambar.
        fondo: '#0A0E13',
        panel: '#131A22',
        panelAlto: '#1A232D',
        borde: '#26313D',
        bordeAlto: '#374555',
        tinta: '#E8EFF6',
        // Tonos SOLIDOS para texto secundario (§13.5): nada de opacidades.
        tenue: '#9BAABB',
        masTenue: '#7B8A9B',
        ambar: '#FFB020',
        ambarSuave: '#FFCE73',
        lima: '#8FD14F',
        rojo: '#FF6B6B',
        cian: '#4FC3D9',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
