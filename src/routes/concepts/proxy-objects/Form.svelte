<script lang="ts">
  import type { PageData } from './$types';
  import { superForm, dateProxy } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, enhance, message, constraints } = superForm(data.form, {
    taintedMessage: null
  });

  const proxyDate = dateProxy(form, 'date', { format: 'date-local' });
</script>

<Debug open={true} data={$form} />

<form
  method="POST"
  action={$page.url.pathname}
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
  use:enhance>
  {#if $message}
    <h3 class="rounded p-2 bg-green-700">{$message}</h3>
  {/if}
  <label class="label">
    <span>Date</span>
    <input
      class="input"
      type="date"
      name="date"
      data-invalid={$errors.date}
      bind:value={$proxyDate}
      {...$constraints.date}
      min={$constraints.date?.min?.toString().slice(0, 10)} />
    {#if $errors.date}<span class="text-red-500" data-invalid
        >{$errors.date}</span
      >{/if}
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
