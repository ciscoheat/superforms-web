<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Progressive enhancement

By retrieving a variable called `enhance` from `superForm` and applying it as an action on the form, we'll get the client-side enhancement expected from a modern webpage:

```svelte
<script lang="ts">
  const { form, errors, enhance } = superForm(data.form);
  //                    ^^^^^^^
</script>

<form method="POST" use:enhance>
```

The rest of the concepts section list all the options for `superForm`, which can be added as a second parameter:

```ts
const { form, errors, enhance } = superForm(data.form, { lotsOfOptions });
```

Most of them require `use:enhance` to be set on the form.

<Next section={concepts} />
