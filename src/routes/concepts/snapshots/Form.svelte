<script lang="ts">
  import { page } from '$app/stores';

  export let form: any;
  export let errors: any;
  export let enhance: any;
  export let message: any;
  export let reset: any;
</script>

<form
  method="POST"
  action={$page.url.pathname}
  class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  {#if $message}
    <h3 data-toc-ignore class="mt-0 rounded bg-green-700 p-2">{$message}</h3>
  {/if}
  <label class="label">
    <span>Name</span>
    <input
      class="input"
      type="text"
      name="name"
      bind:value={$form.name}
      aria-invalid={$errors.name ? 'true' : undefined} />
    {#if $errors.name}<span class="text-red-500">{$errors.name}</span>{/if}
  </label>

  <label class="label">
    <span>E-mail</span>
    <input
      class="input"
      type="text"
      name="email"
      bind:value={$form.email}
      aria-invalid={$errors.email ? 'true' : undefined} />
    {#if $errors.email}<span class="text-red-500">{$errors.email}</span>{/if}
  </label>

  <button type="submit" class="variant-filled btn">Submit</button>
  <button
    type="button"
    on:click={() => reset()}
    class="variant-soft-warning btn ml-3">Reset</button>
</form>
