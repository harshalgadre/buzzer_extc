/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./ExtensionWindow.jsx", "./ExtensionWindow.js"],
  theme: {
    extend: {
      colors: {
        'bg-black': '#060606',
        'sidebar-dark': '#2e2b2b',
        'main-gray': '#4a4a4a',
        'panel-black': '#0b0b0b',
        'accent-orange': '#FF6A2B',
        'callout-brown': '#5A2E17',
        'input-pale': '#E7E7E7',
        'text-white': '#ffffff',
        'text-muted': '#bdbdbd',
        'crown-gold': '#FFD700',
      },
      fontFamily: {
        'inter': ['Inter', 'Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '92': '23rem',
        '320': '80rem',
        '1365': '341.25rem',
        '488': '122rem',
      },
      borderRadius: {
        'xl': '28px',
      },
      boxShadow: {
        'window': '0 6px 24px rgba(0, 0, 0, 0.6)',
        'help': '0 2px 8px rgba(255, 106, 43, 0.3)',
        'inset-subtle': 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
        'callout-inset': 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}

/* Utility classes used in the component:

Layout & Structure:
- w-[1365px] h-[488px] (main window)
- w-[92px] (left sidebar)
- w-[320px] (right panel)
- flex flex-col items-center justify-center
- rounded-[28px] (window border radius)
- relative absolute
- overflow-hidden

Colors & Backgrounds:
- bg-bg-black bg-sidebar-dark bg-main-gray bg-panel-black
- bg-accent-orange bg-callout-brown bg-input-pale
- text-text-white text-text-muted text-accent-orange

Spacing:
- p-4 p-6 px-6 py-4 m-4 mb-8 gap-3 gap-4
- space-y-3 space-y-4

Typography:
- font-inter font-medium font-semibold font-bold
- text-xs text-sm text-base text-lg
- leading-tight leading-normal

Interactive States:
- hover:bg-white/5 hover:border-white/10
- focus:outline-none focus:ring-2 focus:ring-accent-orange
- transition-all duration-200

Effects:
- shadow-window shadow-help shadow-inset-subtle
- backdrop-blur-sm
- opacity-26 (for illustration)

*/ 
