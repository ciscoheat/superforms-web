<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';

  export let data: PageData;

  const { form, errors, allErrors, enhance, tainted, message, constraints } =
    superForm(data.customValidity, {
      taintedMessage: null,
      customValidity: true
    });
</script>

<form
  novalidate
  method="POST"
  action={$page.url.pathname}
  class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  {#if $message}
    <h3 class="rounded bg-green-700 p-2">{$message}</h3>
  {/if}
  <label class="label">
    <span>Name</span>
    <input class="input" type="text" name="name" bind:value={$form.name} />
  </label>

  <label class="label">
    <span>E-mail</span>
    <input class="input" type="text" name="email" bind:value={$form.email} />
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
