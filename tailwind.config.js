/** @type {import('tailwindcss').Config} */
// [[CLIENT_TO_PROVIDE: brand colours]]
// Wired to UI_SPEC.md design tokens
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          ink: 'var(--accent-ink)',
        },
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        bg: {
          base: 'var(--bg-base)',
          light: 'var(--bg-tint-light)',
          dark: 'var(--bg-tint-dark)',
        },
        cafe: {
          bg: 'var(--bg-base)',
          surface: 'var(--glass-strong)',
          muted: 'var(--bg-tint-light)',
          border: 'var(--glass-border)',
          text: 'var(--ink)',
          textMuted: 'var(--ink-muted)',
          accent: 'var(--accent)',
          accentHover: 'var(--accent)',
          accentLight: 'var(--bg-tint-light)',
          danger: 'var(--danger)',
          dangerBg: '#FEF2F2',
          success: 'var(--success)',
          successBg: '#F0FDF4',
          warning: 'var(--warning)',
          warningBg: '#FEFCE8',
        },
      },
      borderRadius: {
        // UI_SPEC Section 1 & 6.2 overrides:
        card: 'var(--radius-card, 16px)',
        sheet: 'var(--radius-sheet, 24px)',
        btn: 'var(--radius-btn, 14px)',
        input: 'var(--radius-input, 12px)',
        chip: 'var(--radius-chip, 12px)',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '14px',
        xl: '16px',
        '2xl': '24px',
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
        DEFAULT: '150ms',
        fast: '100ms',
        tab: '150ms',
        sheet: '250ms',
      },
      transitionTimingFunction: {
        glass: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};
