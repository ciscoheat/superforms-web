<script lang="ts">
	import Header from './Header.svelte'
	import Youtube from '$lib/Youtube.svelte'
	import { displayToC } from '$lib/toc.js';

	displayToC(false)
</script>

<Header />

Superforms is a SvelteKit library that helps you with **server-side validation** and **client-side display** of forms.

It enables you to use a Zod validation schema as a **single source of truth** for a form, with consistent handling of data and validation errors.

The API is minimal, basically a single method on the server and client, but is very flexible and configurable to handle every possible case of:

- Nested data structures
- Multiple forms on the same page
- Tainted fields
- Client-side validation
- And much more.

## Get started

Click here to <a href="/get-started">get started</a> right away, or watch this short video for an introduction to what's possible:

<Youtube id="MiKzH3kcVfs" />
