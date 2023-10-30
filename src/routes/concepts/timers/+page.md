<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import Timers from '$lib/Timers.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Loading timers

<Head title="Timers" />

It's important that the users understand that things are happening when they submit a form. Loading timers give us a way of providing feedback when there is a server response delay, for example by displaying a spinner icon.

## Usage

```ts
const { form, enhance, submitting, delayed, timeout } = superForm(data.form, {
  delayMs?: 500
  timeoutMs?: 8000
})
```

`delayMs` should be positive and always smaller than or equal to `timeoutMs`, otherwise the timer behavior will be undefined.

## Submit state

After a certain time when the form is submitted, determined by `delayMs` and `timeoutMs`, the timers changes state. The states are:

<Timers />

These states affect the readable stores `submitting`, `delayed` and `timeout`, returned from `superForm`. They are not mutually exclusive, so `submitting` won't change to `false` when `delayed` becomes `true`.

## Loading indicators

A perfect use for these timers is to show a loading indicator while the form is submitting:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  const { form, errors, enhance, delayed } = superForm(data.form);
  import spinner from '$lib/assets/spinner.svg';
</script>

<form method="POST" use:enhance>
  <button>Submit</button>
  {#if $delayed}<img src={spinner} />{/if}
</form>
```

The reason for using `delayed` instead of `submitting` is based on the article [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/), which states that for short waiting periods, no feedback is required except to display the result. Therefore, `delayed` is used to show a loading indicator after a little while, not instantly.

## Visualizing the timers

Submit the following form and play around with the different settings. Different loading spinners are set to display when `delayed` and `timeout` are true respectively. 

Submit multiple times to see the effect of the [multipleSubmits](/concepts/submit-behavior#multiplesubmits) option as well.

<Form {data} />

By experimenting with the timers and the delay between them, it's certainly possible to prevent the feeling of unresponsiveness. Please share your results on [Discord](https://discord.gg/AptebvVuhB) or [Github](https://github.com/ciscoheat/sveltekit-superforms/discussions), if you do!

<Next section={concepts} />
