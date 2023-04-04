<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import Timers from '$lib/Timers.svelte';
  import spinner from '$lib/assets/spinner.svg?raw';
  import dots from '$lib/assets/three-dots-loading.svg?raw';
  import { get } from 'svelte/store';

  export let data: PageData;

  let prevented = 0;

  const { form, enhance, message, submitting, delayed, timeout } = superForm(
    data.form,
    {
      taintedMessage: null,
      onSubmit() {
        prevented = 0;
      },
      onError({ message, result }) {
        message.set(result.error.message);
      }
    }
  );
</script>

<Timers {submitting} {delayed} {timeout} />

<form
  method="POST"
  action={$page.url.pathname}
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4 mb-3"
  use:enhance>
  <label for="delay" class="label">
    <RangeSlider name="delay" bind:value={$form.delay} max={15000} step={100}
      >Response delay: {$form.delay} ms</RangeSlider>
  </label>

  <div class="flex items-center gap-x-3">
    <button
      type="submit"
      on:click={() => ++prevented}
      class="btn variant-filled">Submit</button>
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
