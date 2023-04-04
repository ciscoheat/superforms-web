<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Proxy objects

<svelte:head><title>Proxy objects</title></svelte:head>

Sometimes the form data must be proxied, which could happen when you get a `string` value from an input field, third-party library, etc, and want it to be automatically converted and updating a non-string value in your form data structure. Fortunately, there are a number of objects available for that:

## Usage

```ts
import {
  intProxy,
  numberProxy,
  booleanProxy,
  dateProxy
} from 'sveltekit-superforms/client';
```

### intProxy(form, fieldName)

Creates a proxy (store) for an integer in the schema. Changes in either the proxy or the form field will reflect in the other.

### numberProxy(form, fieldName)

Creates a proxy (store) for a number in the schema.

### booleanProxy(form, fieldName, options?)

**Options**

```ts
{
  trueStringValue: 'true';
}
```

Creates a proxy (store) for a boolean form field. The option can be used to change what string value represents `true`.

### dateProxy(form, fieldName, options?)

**Options**

```ts
{ format: 'date-local' | 'datetime-local' | 'time-local' | 'iso' = 'iso' }
```

Creates a proxy store for a date field. The option can be used to format the resulting date string differently, useful when data comes from a date input (see the example below).

## Usage

The usage for all of them is the same:

```ts
// Assume the following schema:
// z.object({ id: z.number().int() })

const { form } = superForm(data.form);
const idProxy = intProxy(form, 'id'); // Writable<string>
```

Now if you bind to `$idProxy` instead of directly to `$form.id`, the value will be converted to an integer and `$form.id` will be updated automatically.

Note that this will usually happen automatically with `bind:value`, so check out all the possible [Svelte bindings](https://svelte.dev/tutorial/text-inputs) first, to avoid complicating the code!

## Test it out

Change the value of the date picker to see it reflect in the date field of the schema. We're also taking advantage of the `min` constraint to automatically limit the date selection to current and future dates only.

<Form {data} />

<Next section={concepts} />
