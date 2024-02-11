<script lang="ts">
  import Head from '$lib/Head.svelte'
  import fileDebug from './file-debug.png'
</script>

# Version 2 - What's new?

<Head title="What's new in Superforms version 2" />

Superforms 2 has finally been released! Here's a presentation of the new features and improvements:

## File upload support!

Finally, it's possible to handle files with Superforms, even with validation on the client. See the dedicated [file uploads section](/concepts/files) for more information.

## SuperDebug

Now that file uploads is a feature, SuperDebug displays file objects properly:

<img src={fileDebug} alt="SuperDebug displaying a File" />

## Union support

An oft-requested feature has been support for unions, which has always been a bit difficult to handle with `FormData` parsing and default values. But unions can now be used in schemas, with a few compromises:

### Unions must have an explicit default value

If a schema field can be more than one type, it's not possible to know what default value should be set for it. Therefore, you must specify a default value for unions explicitly:

```ts
const schema = z.object({
  undecided: z.union([z.string(), z.number()]).default(0)
})
```

### Multi-type unions can only be used when dataType is 'json'

Unions are also quite difficult to make assumptions about in `FormData`. If `"123"` was posted (as all posted values are strings), should it be parsed as a string or a number in the above case?

There is no obvious answer, so unions **with more than one type** can only be used when the `dataType` option is set to `'json'` (which will bypass the whole `FormData` parsing by serializing the form data).

## Form is reset by default

To better follow the SvelteKit defaults, the `resetForm` option for `superForm` is now `true` as default.

## Tainted updates

The default for `taintedMessage` changed too, it is now `false`, so no message will be displayed if the form is modified, unless you set it to either `true`, a string message, or a function that returns a promise resolved to `true` if navigation should proceed (so you can now use a custom dialog for displaying the message).

The tainted store is also smarter, keeping track of the original data, so if you go back to a previous value, it's not considered tainted anymore.

### New isTainted method

A new `isTainted` method is available on `superForm`, to check whether any part of the form is tainted. Use it instead of testing against the `$tainted` store, which may give unexpected results.

```svelte
<script lang="ts">
  const { form, enhance, tainted, isTainted } = superForm(form.data);

  // Check the whole form
  if(isTainted()) {
    console.log('The form is tainted')
  }

  // Check a part of the form
  if(isTainted('name')) {
    console.log('The name field is tainted')
  }
</script>

<!-- Make the function reactive by passing the $tainted store -->
<button disabled={!isTainted($tainted)}>Submit</button>

<!-- It even works with individual fields -->
<button disabled={!isTainted($tainted.name)}>Submit name</button>
```

## onChange event

An `onChange` event is added to the `superForm` options, so you can track specific fields for changes. Check the [events page](/concepts/events#onchange) for the details.

## New validateForm method

Previously you could call `validate()` for retrieving a validation result for the whole form, but you must now use `validateForm()`. There are two options, `{ update?: true, schema?: ValidationAdapter<Partial<T>> }` which can be used to trigger a full client-side validation, and validate the schema partially, which is useful for multi-step forms.

## empty: 'zero' option for intProxy and numberProxy

For number fields, a UX problem has been that the default value for numbers, `0`, hides the placeholder text, and it's not always wanted to have a number there initially. But it's now possible to make this work, with two new options in `intProxy` and `numberProxy`:

```ts
const schema = z.object({
  num: z.number()
})

const proxy = intProxy(form, 'num', { empty: 'zero', initiallyEmptyIfZero: true })
```

The `empty` option, if set to `'zero'`, will set the field to 0 if it's empty, and the unfortunately long `initiallyEmptyIfZero` will ensure the field is empty at first.

## Simplified imports

You may have noticed in the examples that `/client` and `/server` isn't needed anymore. Simply import everything except adapters from `sveltekit-superforms`. The same goes for `SuperDebug`, which is now the default export of the library:

```ts
import { superForm, superValidate, dateProxy } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import SuperDebug from 'sveltekit-superforms';
```

# Migrate now!

Read the detailed [migration guide](/migration-v2) to convert your projects to Superforms version 2. Ask any migration questions in the [#v2-migration](https://discord.gg/4mKwqnu25f) Discord channel, or open an issue on [Github](https://github.com/ciscoheat/sveltekit-superforms/issues)

# Release notes

The [2.0 release notes](https://github.com/ciscoheat/sveltekit-superforms/releases/tag/v2.0.0) have a full list of changes.