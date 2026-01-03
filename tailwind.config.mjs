/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#22222f',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': '#d1d5db',
            '--tw-prose-headings': '#ffffff',
            '--tw-prose-lead': '#9ca3af',
            '--tw-prose-links': '#06b6d4',
            '--tw-prose-bold': '#ffffff',
            '--tw-prose-counters': '#3b82f6',
            '--tw-prose-bullets': '#3b82f6',
            '--tw-prose-hr': 'rgba(255, 255, 255, 0.1)',
            '--tw-prose-quotes': '#e5e7eb',
            '--tw-prose-quote-borders': '#8b5cf6',
            '--tw-prose-captions': '#9ca3af',
            '--tw-prose-code': '#06b6d4',
            '--tw-prose-pre-code': '#e5e7eb',
            '--tw-prose-pre-bg': '#12121a',
            '--tw-prose-th-borders': 'rgba(255, 255, 255, 0.1)',
            '--tw-prose-td-borders': 'rgba(255, 255, 255, 0.1)',
            'h1': {
              color: '#ffffff',
              borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
              paddingBottom: '0.75rem',
              marginTop: '2rem',
            },
            'h2': {
              color: '#3b82f6',
              marginTop: '2.5rem',
            },
            'h3': {
              color: '#8b5cf6',
              marginTop: '2rem',
            },
            'a': {
              color: '#06b6d4',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              '&:hover': {
                color: '#ffffff',
              },
            },
            'strong': {
              color: '#ffffff',
            },
            'code': {
              color: '#06b6d4',
              backgroundColor: '#12121a',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'pre': {
              backgroundColor: '#12121a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
            },
            'blockquote': {
              borderLeftColor: '#8b5cf6',
              backgroundColor: 'rgba(18, 18, 26, 0.5)',
              padding: '0.5rem 1rem',
              borderRadius: '0 0.5rem 0.5rem 0',
              fontStyle: 'italic',
            },
            'p': {
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
              lineHeight: '1.7',
            },
            'ul': {
              marginTop: '1rem',
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
            },
            'ol': {
              marginTop: '1rem',
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
            },
            'li': {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
            },
            'ul > li::marker': {
              color: '#3b82f6',
            },
            'ol > li::marker': {
              color: '#3b82f6',
            },
            'h2 + p': {
              marginTop: '1rem',
            },
            'h3 + p': {
              marginTop: '0.75rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
