<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Proxy objects

<Head title="Proxy objects" />

Sometimes the form data must be proxied, which could happen when you get a `string` value from an input field, third-party library, etc. and want it to be automatically converted and updated with a non-string value in your schema. There are a number of functions available for that:

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

> See [the API](/api#proxy-objects) for a detailed description of each kind of proxy. intProxy and numberProxy are rarely needed as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs) with `bind:value`.

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

## Nested proxies

You can use a proxy for nested data, like `'user.profile.email'`, but you must ensure that all parent objects exist for the proxy to be able to access the "final" field. In this case, if `user` or `profile` is optional and `undefined`, it won't work. The easiest way to prevent this is to not make any parent objects optional or nullable in the schema.

## Date input issues

The `date` input type is a bit special, its underlying data is a string in `yyyy-mm-dd` format, and the `dateProxy` returns an ISO date string as default, so you need to use the `format` option to return the date part only:

```ts
const proxyDate = dateProxy(form, 'date', { format: 'date' });
```

```svelte
<input
  name="date"
  type="date"
  bind:value={$proxyDate}
  aria-invalid={$errors.date ? 'true' : undefined}
  {...$constraints.date}
  min={$constraints.date?.min?.toString().slice(0, 10)}
  max={$constraints.date?.max?.toString().slice(0, 10)} 
/>
```

We're also taking advantage of the `min` and `max` constraints to limit the date picker selection. The following example limits the date from today and forward, and also uses the [empty option](/api#dateproxyform-fieldname-options) of the proxy, to set an invalid date to `undefined`:

<Form {data} />

<Next section={concepts} />
