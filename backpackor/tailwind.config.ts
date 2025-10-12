import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './component/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4154FF',
        background: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config