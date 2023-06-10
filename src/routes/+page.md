<script lang="ts">
	import Header from './Header.svelte'
	import Youtube from '$lib/Youtube.svelte'
	import Gallery from './Gallery.svelte'
</script>

<svelte:head><title>Superforms for SvelteKit</title></svelte:head>

> Superforms 1.0 has just been released! Check out [what's new](/whats-new-v1), and the [migration guide](/migration) for information on how to update. Documentation for 0.x can be found [here](https://superforms-legacy.vercel.app/).

<Header />

Superforms is a SvelteKit library that gives you a comprehensive solution for **server-side validation** and **client-side display** of forms.

It uses a Zod validation schema as a **single source of truth**, with consistent handling of form data and validation errors, with full type safety. It works with both TypeScript and JavaScript.

The API is minimal, basically a single method on the server and client, but it's very flexible and configurable to handle every possible case of:

<Gallery />

## Get started

Click [here to get started](/get-started) right away, or watch this video for an introduction to what's possible with Superforms:

<Youtube id="MiKzH3kcVfs" />

<br><br>
