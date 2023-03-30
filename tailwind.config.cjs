/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		require("path").join(
			require.resolve("@skeletonlabs/skeleton"),
			"../**/*.{html,js,svelte,ts}",
		),
	],
	theme: {
		screens: {
			sm: "576px",
			// => @media (min-width: 576px) { ... }

			md: "860px",
			// => @media (min-width: 960px) { ... }

			lg: "1024px",
			// => @media (min-width: 1440px) { ... }
		},
		extend: {},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/line-clamp"),
		...require("@skeletonlabs/skeleton/tailwind/skeleton.cjs")(),
	],
};
