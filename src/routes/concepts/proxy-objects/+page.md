<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Proxy objects

<svelte:head><title>Proxy objects</title></svelte:head>

Sometimes the form data must be proxied, which could happen when you get a `string` value from an input field, third-party library, etc, and want it to be automatically converted and updating a non-string value in your schema. There are a number of functions available for that:

## Usage

```ts
import {
  intProxy,
  numberProxy,
  booleanProxy,
  dateProxy,
  stringProxy
} from 'sveltekit-superforms/client';
```

> See [the API](/api#proxy-objects) for a detailed description of each kind of proxy.

## Usage

The usage for all of them is the same:

```ts
// Assume the following schema:
// z.object({ id: z.number().int() })

const { form } = superForm(data.form);

// Returns a Writable<string>
const idProxy = intProxy(form, 'id');
```

Now if you bind to `$idProxy` instead of directly to `$form.id`, the value will be converted to and from an integer, and `$form.id` will be updated automatically.

Note that this will usually happen automatically with `bind:value`, so check out all the possible [Svelte bindings](https://svelte.dev/tutorial/text-inputs) first, to avoid complicating the code!

## Test it out

Change the value of the date picker to see it reflect in the date field of the schema. We're also taking advantage of the `min` constraint to automatically limit the date selection to current and future dates only.

<Form {data} />

<Next section={concepts} />
