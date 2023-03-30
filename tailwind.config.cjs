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
            h3: {
              marginTop: '2rem'
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
