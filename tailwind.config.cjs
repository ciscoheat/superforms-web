/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    require('path').join(
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
      typography: {
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
              marginBottom: '1.25rem'
            },
            h3: {
              marginTop: '1.5rem'
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
              marginBottom: '1.25rem!important'
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
            }
          }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    ...require('@skeletonlabs/skeleton/tailwind/skeleton.cjs')()
  ]
};
