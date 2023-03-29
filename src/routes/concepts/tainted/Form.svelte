<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, enhance, message, constraints } = superForm(data.form);
</script>

<Debug data={$form} />

<form
  method="POST"
  action={$page.url.pathname}
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
  use:enhance
>
  {#if $message}
    <h3 class="rounded p-2 bg-green-700">{$message}</h3>
  {/if}
  <label class="label">
    <span
      >Name {#if $constraints.name?.required}*{/if}</span
    >
    <input class="input" type="text" name="name" bind:value={$form.name} />
    {#if $errors.name}<span class="text-red-500">{$errors.name}</span>{/if}
  </label>

  <label class="label">
    <span
      >E-mail {#if $constraints.email?.required}*{/if}</span
    >
    <input class="input" type="text" name="email" bind:value={$form.email} />
    {#if $errors.email}<span class="text-red-500">{$errors.email}</span>{/if}
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
