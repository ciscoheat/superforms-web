<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';
  import { zod } from 'sveltekit-superforms/adapters';
  import { schema } from './schema';

  export let data: PageData;

  const { form, errors, message, enhance } = superForm(data.form, {
    dataType: 'json',
    errorSelector: '.input-error',
    validators: zod(schema),
    taintedMessage: null
  });
</script>

<Debug data={$form} />

<form
  method="POST"
  action={$page.url.pathname}
  class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  {#if $message}
    <h3 data-toc-ignore class="mt-0 rounded bg-green-700 p-2">{$message}</h3>
  {/if}
  <div class="grid grid-cols-[20%_80%] gap-3">
    {#each $form.tags as _, i}
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim">Id</div>
        <input
          type="number"
          class:input-error={$errors.tags?.[i]?.id}
          bind:value={$form.tags[i].id} />
      </div>
      <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim">Name</div>
        <input
          type="text"
          class:input-error={$errors.tags?.[i]?.name}
          bind:value={$form.tags[i].name} />
      </div>
      {#if $errors.tags?.[i]?.id && $errors.tags?.[i]?.name}
        <div class="col-start-1 ml-4 text-red-500">{$errors.tags?.[i]?.id}</div>
        <div class="col-start-2 ml-4 text-red-500">
          {$errors.tags?.[i]?.name}
        </div>
      {:else if $errors.tags?.[i]?.id}
        <div class="col-span-full ml-4 text-red-500">
          {$errors.tags?.[i]?.id}
        </div>
      {:else if $errors.tags?.[i]?.name}
        <div class="col-start-2 ml-4 text-red-500">
          {$errors.tags?.[i]?.name}
        </div>
      {/if}
    {/each}
  </div>

  <div>
    <button type="submit" class="variant-filled btn">Submit</button>
  </div>
</form>
