<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Next from '$lib/Next.svelte'
  import { concepts } from '$lib/navigation/sections'
</script>

# Submit behavior

<Head title="Submit behavior" />

When a form is submitted, it's important for the UX to show that things are happening on the server. Superforms provides you with [loading timers](/concepts/timers) and the following options for handling this:

## Usage

```ts
const { form, enhance } = superForm(data.form, {
  clearOnSubmit: 'message' | 'errors' | 'errors-and-message' | 'none' = 'message'
  multipleSubmits: 'prevent' | 'allow' | 'abort' = 'prevent'
})
```

### clearOnSubmit

The `clearOnSubmit` option decides what should happen to the form when submitting. It can clear the [status message](/concepts/messages), all the [errors](/concepts/error-handling), both, or none. The default is to clear the message.

If you don't want any jumping content, which could occur when errors and messages are removed from the DOM, setting it to `none` can be useful.

### multipleSubmits

This one handles the occurence of multiple form submissions, before a result has been returned.

- When set to the default `prevent`, the form cannot be submitted again until a result is returned, or the `timeout` state is reached (see the section about [loading timers](/concepts/timers)).
- `abort` is the next sensible approach, which will cancel the previous request before submitting again.
- Finally, `allow` will pass through any number of frenetic clicks on the submit button!

<Next section={concepts} />
