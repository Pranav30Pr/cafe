/** @type {import('tailwindcss').Config} */
// [[CLIENT_TO_PROVIDE: brand colours]]
// Until supplied by client, using neutral palette per spec section 0.2:
// off-white background, near-black text, one muted accent.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cafe: {
          bg: '#FAF8F5',         // off-white background
          surface: '#FFFFFF',    // white surface
          muted: '#F2EFE9',      // subtle card / secondary surface
          border: '#E3DFD7',     // soft neutral border
          text: '#1C1917',       // near-black primary text
          textMuted: '#57534E',  // accessible secondary text (>= 4.5:1 ratio on bg)
          accent: '#4A3525',     // [[CLIENT_TO_PROVIDE: brand colours]] - muted deep roast brown accent
          accentHover: '#38281C',
          accentLight: '#EFE9E1',
          danger: '#991B1B',     // accessible dark red for alerts
          dangerBg: '#FEF2F2',
          success: '#166534',    // accessible dark green for success/veg
          successBg: '#F0FDF4',
          warning: '#854D0E',    // egg / caution
          warningBg: '#FEFCE8',
        },
      },
      borderRadius: {
        // Spec rule 0.2: Maximum border radius on buttons, inputs and cards is 6px. No pill-shaped buttons.
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '6px',
        xl: '6px',
        '2xl': '6px',
        '3xl': '6px',
        full: '6px', // safeguard: prevent pill shapes even if rounded-full is attempted
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      transitionDuration: {
        // Spec rule 0.2: Motion is limited to simple state feedback of 150ms or less
        DEFAULT: '150ms',
        fast: '100ms',
      },
    },
  },
  plugins: [],
};
