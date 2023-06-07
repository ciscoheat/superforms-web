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
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
  use:enhance>
  {#if $message}
    <h3 class="rounded p-2 bg-green-700">{$message}</h3>
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

  <button type="submit" class="btn variant-filled">Submit</button>
  <button
    type="button"
    on:click={() => reset()}
    class="ml-3 btn variant-soft-warning">Reset</button>
</form>
