export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0e27',
        'dark-card': '#1a1f3a',
        'neon-blue': '#00d9ff',
        'neon-purple': '#b300ff',
        'glow-blue': '#0099ff',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 217, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(179, 0, 255, 0.5)',
        'glow-intense': '0 0 30px rgba(0, 217, 255, 0.8)',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'typing': 'typing 3s steps(40, end), blink 0.75s step-end infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'loading-bar': 'loading-bar 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.8)' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 50%': { borderColor: 'transparent' },
          '50%': { borderColor: '#00d9ff' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'loading-bar': {
          '0%': { width: '0%' },
          '50%': { width: '80%' },
          '100%': { width: '100%' },
        },
      },
      backdropFilter: {
        'glass': 'backdrop-filter: blur(10px)',
      },
    },
  },
  plugins: [],
}
