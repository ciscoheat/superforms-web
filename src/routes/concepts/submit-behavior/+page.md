<script lang="ts">
  import Next from '$lib/Next.svelte'
  import { concepts } from '$lib/navigation/sections'
</script>

# Submit behavior

<svelte:head><title>Submit behavior</title></svelte:head>

When the user submits a form, it's important for the user experience to show that things are processing. Superforms provides you with timers (see next section) and the following options for handling this:

## Usage

```ts
const { form, enhance } = superForm(data.form, {
  clearOnSubmit: 'errors' | 'message' | 'errors-and-message' | 'none' = 'errors-and-message'
  multipleSubmits: 'prevent' | 'allow' | 'abort' = 'prevent'
})
```

### clearOnSubmit

The `clearOnSubmit` option decides what should happen to the form when submitting. It can clear all the `errors`, the `message`, both or none. The default is to clear both.

If you don't want any jumping content, which could occur when error messages are removed from the DOM, setting it to one of the other options can be useful.

### multipleSubmits

This one is as much for the sake of the server than of the user.

- When set to `prevent`, the form cannot be submitted again until a result is received, or the `timeout` state is reached (see next section about timers).
- `abort` is the next sensible approach, which will cancel the previous request before submitting again.
- Finally, `allow` will pass through any number of frenetic clicks on the submit button!

<Next section={concepts} />
