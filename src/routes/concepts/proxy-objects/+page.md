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

Sometimes the form data must be proxied, which could happen when you get a `string` value from an input field, third-party library, etc. and want it to be automatically converted and updated with a non-string value in your schema.

```ts
import {
  // The first ones uses the $form store
  // and is always a Writable<string>:
  booleanProxy,
  dateProxy,
  intProxy,
  numberProxy,
  stringProxy,
  // These two uses the whole object returned from
  // superForm. Type depends on the field.
  formFieldProxy,
  arrayProxy,
  // Can use any object. Type depends on the field.
  fieldProxy      
} from 'sveltekit-superforms/client';
```

The usage for all of them is practically the same, only the initial argument will differ, as described above.

```ts
import { superForm, intProxy } from 'sveltekit-superforms/client';

// Assume the following schema:
// z.object({ id: z.number().int() })

const { form } = superForm(data.form);

// Returns a Writable<string>
const idProxy = intProxy(form, 'id');
```

Now if you bind to `$idProxy` instead of `$form.id`, the value will be converted to and from an integer, and `$form.id` will be updated automatically.

Note that this kind of conversion will usually happen automatically with `bind:value`. `intProxy` and `numberProxy` are rarely needed, as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs). But proxies may still be useful if you want to set the value to `undefined` or `null` when the value is falsy, in which case you can use the `empty` option.

> See [the API](/api#proxy-objects) for more details and options for each kind of proxy.

## Nested proxies

You can use a proxy for nested data, like `'user.profile.email'`, in which case parent objects will be created if they don't exist.

## Date input issues

The `date` input type is a bit special. Its underlying data is a string in `yyyy-mm-dd` format, but the `dateProxy` returns an ISO date string as default, so you need to use the `format` option to return the date part only:

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
