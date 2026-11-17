/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Status Desa
        status: {
          aman: {
            bg: '#f0fdf4',
            border: '#bbf7d0',
            text: '#166534',
            solid: '#22c55e',
          },
          waspada: {
            bg: '#fefce8',
            border: '#fde047',
            text: '#854d0e',
            solid: '#eab308',
          },
          siaga: {
            bg: '#fff7ed',
            border: '#fed7aa',
            text: '#c2410c',
            solid: '#f97316',
          },
          awas: {
            bg: '#fef2f2',
            border: '#fecaca',
            text: '#991b1b',
            solid: '#ef4444',
          },
        },
        // Status Laporan
        laporan: {
          baru: {
            bg: '#eff6ff',
            border: '#bfdbfe',
            text: '#1e40af',
            solid: '#3b82f6',
          },
          diverifikasi: {
            bg: '#f5f3ff',
            border: '#c4b5fd',
            text: '#5b21b6',
            solid: '#8b5cf6',
          },
          ditangani: {
            bg: '#fffbeb',
            border: '#fde68a',
            text: '#92400e',
            solid: '#f59e0b',
          },
          selesai: {
            bg: '#f0fdf4',
            border: '#bbf7d0',
            text: '#166534',
            solid: '#22c55e',
          },
        },
        // Primary brand
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      borderRadius: {
        'card': '0.75rem', // 12px
        'card-lg': '1rem', // 16px
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'nav': '0 -2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
