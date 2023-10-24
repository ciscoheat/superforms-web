<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, enhance, tainted, message, constraints } = superForm(
    data.form,
    { taintedMessage: null }
  );
</script>

<Debug label="$tainted store" status={false} open={true} data={$tainted} />

<form
  method="POST"
  action={$page.url.pathname}
  class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  {#if $message}
    <h3 data-toc-ignore class="mt-0 rounded bg-green-700 p-2">{$message}</h3>
  {/if}
  <label class="label">
    <span
      >Name {#if $constraints.name?.required}*{/if}</span>
    <input class="input" type="text" name="name" bind:value={$form.name} />
    {#if $errors.name}<span class="text-red-500">{$errors.name}</span>{/if}
  </label>

  <label class="label">
    <span
      >E-mail {#if $constraints.email?.required}*{/if}</span>
    <input class="input" type="text" name="email" bind:value={$form.email} />
    {#if $errors.email}<span class="text-red-500">{$errors.email}</span>{/if}
  </label>

  <button type="submit" class="variant-filled btn">Submit</button>
</form>
