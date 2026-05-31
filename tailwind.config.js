export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: '#ededed', muted: '#888888', soft: '#555555' },
        night:  { 950: '#0c0c0c', 900: '#111111', 800: '#161616', 700: '#1c1c1c', 600: '#202020' },
        violet: { 900: '#0a2419', 700: '#24b47e', 600: '#3ecf8e', 500: '#3ecf8e', 400: '#4ade80', 300: '#86efac', 200: '#bbf7d0', 100: '#dcfce7' },
        gold:   { 700: '#9A7A3C', 600: '#B3904D', 500: '#C9A86A', 400: '#D9BD85', 300: '#E8D0A0', 100: '#F6EDD8' },
        glass:  { DEFAULT: 'rgba(255,255,255,0.03)', raised: 'rgba(255,255,255,0.05)', strong: 'rgba(255,255,255,0.07)' },
        line:   'rgba(255,255,255,0.08)',
        rose:   { 600: '#C97B9B', 700: '#A86483' },
        mint:   { 500: '#3ecf8e', 600: '#24b47e' },
      },
      fontFamily: {
        serif:            ['"Crimson Pro"', 'Georgia', 'serif'],
        sans:             ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:             ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        arabic:           ['"Noto Naskh Arabic"', 'Amiri', 'serif'],
        'arabic-display': ['"Reem Kufi"', '"Noto Kufi Arabic"', 'sans-serif'],
        'arabic-classic': ['"Aref Ruqaa"', '"Amiri"', 'serif'],
        'arabic-ui':      ['"Noto Kufi Arabic"', '"Noto Naskh Arabic"', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 60px -20px rgba(10,4,28,0.6)',
        glow:  '0 0 0 1px rgba(178,148,255,0.18), 0 12px 40px -8px rgba(139,92,246,0.45)',
        gold:  '0 0 0 1px rgba(212,165,116,0.3), 0 12px 32px -10px rgba(212,165,116,0.4)',
      },
      letterSpacing: { tightest: '-0.04em' },
    },
  },
  plugins: [],
};
