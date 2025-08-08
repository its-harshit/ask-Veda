/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Summary card color scheme (matching the image)
        primary: {
          50: '#eef2ff',   // Light lavender background
          100: '#e0e7ff',  // Card background
          200: '#c7d2fe',  // Icon background
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#26387E',  // Main color from image
          600: '#1e2b64',  // Darker shade
          700: '#1a234f',
          800: '#151b3a',
          900: '#0f1426',
        },
        // Professional grays (matching the image)
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',  // Data labels color
          700: '#374151',
          800: '#1f2937',
          900: '#111827',  // Title text color
        },
        // Status colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Background colors (matching the image)
        background: {
          primary: '#ffffff',
          secondary: '#eef2ff',  // Light lavender background
          tertiary: '#e0e7ff',   // Card background
        },
        // Text colors (matching the image)
        text: {
          primary: '#111827',    // Title text (dark charcoal)
          secondary: '#4b5563',  // Data labels (medium gray)
          tertiary: '#6b7280',
          accent: '#26387E',     // Data values (matching primary)
          inverse: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
} 