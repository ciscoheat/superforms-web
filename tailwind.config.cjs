// @ts-check
import { join } from 'path';

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(
      require.resolve('@skeletonlabs/skeleton'),
      '../**/*.{html,js,svelte,ts}'
    )
  ],
  theme: {
    screens: {
      sm: '576px',
      // => @media (min-width: 576px) { ... }

      md: '860px',
      // => @media (min-width: 960px) { ... }

      lg: '1024px'
      // => @media (min-width: 1440px) { ... }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      typography: (them) => ({
        DEFAULT: {
          css: {
            p: {
              marginBottom: '1.25rem',
              marginTop: 0
            },
            'code::before': {
              content: 'none'
            },
            'code::after': {
              content: 'none'
            },
            'code:is(:not(pre *))': {
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              whiteSpace: 'nowrap',
              backgroundColor: 'rgb(var(--color-primary-500) / 0.2)',
              color: 'rgb(var(--color-primary-400) / 1)',
              opacity: '1',
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem'
            },
            ul: {
              listStyle: 'none'
            },
            'ul li::before': {
              content: "'💥 '"
            },
            'ul li': {
              marginTop: '1rem',
              marginBottom: '1rem'
            },
            h1: {
              marginBottom: '1.5rem'
            },
            h2: {
              marginTop: '2.5rem',
              marginBottom: '1rem'
            },
            h3: {
              marginTop: '1.75rem'
            },
            h4: {
              fontSize: '1.125rem'
            },
            'a:is(.card)': {
              textDecoration: 'none'
            },
            'a:not(.card)': {
              color: 'rgb(var(--color-primary-500))',
              textDecoration: 'underline',
              '&:hover': {
                filter: 'brightness(110%)'
              }
            },
            'div pre': {
              marginBottom: '1.25rem!important',
              marginTop: '0.5rem!important'
            },
            form: {
              marginBottom: '1.25rem'
            },
            table: {
              marginTop: 0
            },
            'table td': {
              padding: '1rem!important',
              whiteSpace: 'normal!important'
            },
            'table th': {
              whiteSpace: 'nowrap!important'
            },
            'div.card': {
              marginBottom: '1.25rem!important',
              marginTop: '1.25rem!important'
            },
            '.super-debug--pre': {
              marginTop: '1.25rem!important'
            }
          }
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    skeleton
  ]
};
