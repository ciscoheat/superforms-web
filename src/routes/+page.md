<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Header from './Header.svelte'
	import Youtube from '$lib/Youtube.svelte'
	import Gallery from './Gallery.svelte'
  import Libraries from '$lib/LibrariesButtons.svelte'
  import ReleaseV2 from './ReleaseV2.svelte'
  import bugbug from '$lib/assets/bugbug-yellow.svg'
</script>

<Head />

<ReleaseV2 />

<Header />

Superforms is a SvelteKit form library that brings you a comprehensive solution for **server and client form validation**. It supports a multitude of validation libraries:

<Libraries url="/get-started/" />

Pick your favorite, Superforms takes care of the rest with consistent handling of form data and validation errors, with full type safety. It works with both TypeScript and JavaScript, even in static and single-page apps.

The API is minimal, basically a single method on the server and client, but it's very flexible and configurable to handle every possible case of:

<Gallery />

## Get started

Click [here to get started](/get-started) right away, or watch this video for an introduction to what's possible with Superforms:

<Youtube id="MiKzH3kcVfs" />

<br><br><br>

<div class="flex flex-col items-center">
  <div class="text-gray-500 mb-4">Browser testing by</div>
  <a href="https://bugbug.io/"><img class="w-36 m-0 p-0" src={bugbug}></a>
</div>