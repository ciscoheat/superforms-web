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

```ts
const { form, enhance, isTainted } = superForm(form.data);

// Check the whole form
if(isTainted())

// Check a part of the form
if(isTainted('name'))
```

## onChange event

An `onChange` event is added to the `superForm` options, so you can track specific fields for changes:

```ts
const { form, errors, enhance } = superForm(data.form, {
  onChange(event) {
    if(event.target) {
      // Form input event
      console.log(
        event.path, 'was changed from', event.target, 
        'in form', event.formElement
      );
    } else {
      // Programmatic event
      console.log('Fields updated:', event.paths)
    }
  }
})
```

## validate method improved

The [validate](/concepts/client-validation#validate) method is useful for retrieving the validation result for the whole form, or a specific field. You can now also call `validate({ update: true })` to trigger a full client-side validation.

## Simplified imports

You may have noticed in the examples that `/client` and `/server` isn't needed anymore. Simply import everything except adapters from `sveltekit-superforms`. The same goes for `SuperDebug`, which is now the default export of the library:

```ts
import { superForm, superValidate, dateProxy } from 'sveltekit-superforms';
import SuperDebug from 'sveltekit-superforms';
```

## Release notes

The [2.0 release notes](https://github.com/ciscoheat/sveltekit-superforms/releases/tag/v2.0.0) have a full list of changes, and as usual, let me know on [Discord](https://discord.gg/AptebvVuhB) or [Github](https://github.com/ciscoheat/sveltekit-superforms) if something is unclear or not working.
