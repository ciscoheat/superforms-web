<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';

  export let data: PageData;

  const { form, errors, message, enhance } = superForm(data.form, {
    dataType: 'json',
    errorSelector: '.input-error'
  });
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
  <div class="grid gap-3 grid-cols-[20%_80%]">
    {#each $form.tags as _, i}
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim">Id</div>
        <input
          type="number"
          class:input-error={$errors.tags?.[i]?.id}
          bind:value={$form.tags[i].id}
        />
      </div>
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim">Name</div>
        <input
          type="text"
          class:input-error={$errors.tags?.[i]?.name}
          bind:value={$form.tags[i].name}
        />
      </div>
      {#if $errors.tags?.[i]?.id && $errors.tags?.[i]?.name}
        <div class="ml-4 text-red-500 col-start-1">{$errors.tags?.[i]?.id}</div>
        <div class="ml-4 text-red-500 col-start-2">
          {$errors.tags?.[i]?.name}
        </div>
      {:else if $errors.tags?.[i]?.id}
        <div class="ml-4 text-red-500 col-span-full">
          {$errors.tags?.[i]?.id}
        </div>
      {:else if $errors.tags?.[i]?.name}
        <div class="ml-4 text-red-500 col-start-2">
          {$errors.tags?.[i]?.name}
        </div>
      {/if}
    {/each}
  </div>

  <div>
    <button type="submit" class="btn variant-filled">Submit</button>
  </div>
</form>

<style lang="scss">
  .error {
  }
</style>
