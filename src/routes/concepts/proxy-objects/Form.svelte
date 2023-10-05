<script lang="ts">
  import type { PageData } from './$types';
  import { dateProxy, superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, enhance, message, constraints } = superForm(data.form, {
    taintedMessage: null
  });
  const proxyDate = dateProxy(form, 'date', {
    format: 'date',
    empty: 'undefined'
  });
</script>

<Debug open={true} data={$form} />

<form
  method="POST"
  action={$page.url.pathname}
  class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  {#if $message}
    <h3 class="rounded bg-green-700 p-2">{$message}</h3>
  {/if}
  <label class="label">
    <span>Date</span>
    <input
      class="input"
      type="date"
      name="date"
      aria-invalid={$errors.date ? 'true' : undefined}
      bind:value={$proxyDate}
      {...$constraints.date}
      min={$constraints.date?.min?.toString().slice(0, 10)}
      max={$constraints.date?.max?.toString().slice(0, 10)} />

    {#if $errors.date}
      <span class="text-red-500" data-invalid>{$errors.date}</span>
    {/if}
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
