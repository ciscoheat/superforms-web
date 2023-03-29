<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import Timers from '$lib/Timers.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Timers

As said in the previous section, the user should understand that things are happening when they submit the form. Timers gives us a way of providing feedback at the right time, based upon human perception research.

## Options

```ts
const { form, enhance, submitting, delayed, timeout } = superForm(data.form, {
  delayMs: number = 500
  timeoutMs: number = 8000
})
```

## Submit state

The `delayMs` and `timeoutMs` decides how long before the submission changes state. The states are:

<Timers />

These states affect the readable stores `submitting`, `delayed` and `timeout` returned from `superForm`. They are not mutually exclusive, so `submitting` won't change to `false` when `delayed` becomes `true`.

## Loading indicators

A perfect use for these timers is to show a loading indicator while the form is submitting:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  const { form, errors, enhance, delayed } = superForm(data.form);
</script>

<div>
  <button>Submit</button>
  {#if $delayed}<span class="delayed">Working...</span>{/if}
</div>
```

The reason for not using `submitting` is based on the article [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/), which states that for short waiting periods, no feedback is required except to display the result. Therefore, `delayed` is instead used to show a loading indicator after a little while.

## Visualizing the timers

Try submitting this form and see how different delay times affect the timers. Loading spinners are set to display when `delayed` and `timeout` are true.

<Form {data} />

Experimenting with these three timers and the delays between them, is certainly possible to prevent the feeling of unresponsiveness in many cases. Please [share your results](https://github.com/ciscoheat/sveltekit-superforms/discussions), if you do!

<Next section={concepts} />
