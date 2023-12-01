<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Header from './Header.svelte'
	import Youtube from '$lib/Youtube.svelte'
	import Gallery from './Gallery.svelte'
</script>

<Head title="Superforms for SvelteKit" />

> Superforms v2 development is about to start, with the goal of supporting all validation libraries! Please read the [introductory post](https://blog.encodeart.dev/superforms-v2-supporting-all-validation-libraries), feedback is welcome!

<Header />

Superforms is a SvelteKit library that gives you a comprehensive solution for **server and client validation**, and **client-side display** of forms.

It uses a Zod validation schema as a single source of truth, with consistent handling of form data and validation errors, with full type safety. It works with both TypeScript and JavaScript, even in static and single-page apps.

The API is minimal, basically a single method on the server and client, but it's very flexible and configurable to handle every possible case of:

<Gallery />

## Get started

Click [here to get started](/get-started) right away, or watch this video for an introduction to what's possible with Superforms:

<Youtube id="MiKzH3kcVfs" />

<br><br>
