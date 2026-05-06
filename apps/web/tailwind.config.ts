import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Two-tone brand palette — volt + coral on warm-black canvas.
        // Neutrals are structure, not color.
        canvas: {
          DEFAULT: '#07070A',
          raised: '#0E0E12',
          sunken: '#040406',
        },
        ink: {
          DEFAULT: '#F4F4F0', // warm white
          dim: '#A0A0A6',
          muted: '#5F5F66',
          ghost: '#2C2C32',
        },
        line: {
          DEFAULT: '#1C1C22',
          strong: '#2A2A32',
          faint: '#13131A',
        },
        volt: {
          DEFAULT: '#D9FF3C',
          deep: '#A6CC1F',
          glow: '#E8FF7A',
          dim: '#5C6B1A',
        },
        coral: {
          DEFAULT: '#FF5C5C',
          deep: '#D43A3A',
          glow: '#FF8585',
          dim: '#6B2424',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        crunch: '-0.06em',
      },
      fontSize: {
        // Editorial scale — big-and-small, no middle ground.
        micro: ['10px', { lineHeight: '1.2', letterSpacing: '0.08em' }],
        hero: ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        mega: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fade-in 0.4s ease forwards',
        'q-pulse': 'q-pulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
        'cipher-cycle': 'cipher-cycle 0.08s steps(1) infinite',
        'bar-fill': 'bar-fill 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'q-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'cipher-cycle': {
          '0%, 100%': { opacity: '1' },
        },
        'bar-fill': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      boxShadow: {
        'glow-volt': '0 0 0 1px rgba(217, 255, 60, 0.15), 0 0 40px -8px rgba(217, 255, 60, 0.4)',
        'glow-coral': '0 0 0 1px rgba(255, 92, 92, 0.15), 0 0 40px -8px rgba(255, 92, 92, 0.4)',
        'inset-line': 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'volt-fade': 'linear-gradient(135deg, #D9FF3C 0%, #A6CC1F 100%)',
        'coral-fade': 'linear-gradient(135deg, #FF5C5C 0%, #D43A3A 100%)',
        'canvas-radial':
          'radial-gradient(ellipse at top, rgba(217,255,60,0.04) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
