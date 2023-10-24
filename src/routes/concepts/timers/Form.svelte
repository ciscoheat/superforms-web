<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import Timers from '$lib/Timers.svelte';
  import spinner from '$lib/assets/spinner.svg?raw';
  import dots from '$lib/assets/three-dots-loading.svg?raw';
  import { tick } from 'svelte';

  export let data: PageData;

  let prevented = 0;

  const { form, enhance, message, submitting, delayed, timeout, options } =
    superForm(data.form, {
      taintedMessage: null,
      onSubmit() {
        prevented = 0;
      },
      onError({ message, result }) {
        message.set(result.error.message);
      },
      timeoutMs: 2000
    });
</script>

<Timers
  bind:delayMs={options.delayMs}
  bind:timeoutMs={options.timeoutMs}
  {submitting}
  {delayed}
  {timeout} />

<form
  method="POST"
  action={$page.url.pathname}
  class="mb-3 space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  <label for="delay" class="label">
    <RangeSlider name="delay" bind:value={$form.delay} max={9900} step={100}
      >Server response delay: {$form.delay} ms</RangeSlider>
  </label>

  <label for="delayed" class="label">
    <RangeSlider
      name="delay"
      bind:value={options.delayMs}
      max={9900}
      step={100}
      on:change={async () => {
        await tick();
        if (
          options.delayMs &&
          options.timeoutMs &&
          options.delayMs > options.timeoutMs
        ) {
          options.delayMs = options.timeoutMs;
        }
      }}>delayMs option: {options.delayMs} ms</RangeSlider>
  </label>

  <label for="timeout" class="label">
    <RangeSlider
      name="timeout"
      bind:value={options.timeoutMs}
      max={9900}
      step={100}>timeoutMs option: {options.timeoutMs} ms</RangeSlider>
  </label>

  <div class="flex items-center gap-x-3">
    <button
      type="submit"
      on:click={() => ++prevented}
      class="variant-filled btn">Submit</button>
    <div class="spinner">
      {#if $message}<div
          class="rounded p-2 {$page.status == 200
            ? 'text-green-600'
            : 'text-red-500'}">
          {$message}
        </div>
      {:else if $timeout}{@html dots}
      {:else if $delayed}{@html spinner}
      {/if}
    </div>
    {#if $submitting && prevented > 0}
      <div>
        Prevented submit {prevented} time{prevented > 1 ? 's' : ''}
      </div>
    {/if}
  </div>
</form>

<style lang="scss">
  :global(.spinner svg) {
    width: 32px;
    height: 32px;
  }
</style>
