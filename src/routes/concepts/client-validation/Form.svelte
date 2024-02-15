<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';
  import { tick } from 'svelte';
  import { superformClient } from 'sveltekit-superforms/adapters';

  export function formData() {
    return form;
  }

  let newTag = '';
  let newTagEl: HTMLInputElement;

  export let data: PageData;

  const { form, errors, enhance, message } = superForm(data.form, {
    taintedMessage: null,
    validators: superformClient({
      tags: (tag?) => (!tag || tag.length < 2 ? 'Tag must be at least 2 characters' : null)
    })
  });

  async function addTag() {
    if (!newTag) return;
    if (!$form.tags) $form.tags = [];
    $form.tags = [...$form.tags, newTag];
    await tick();
    setTimeout(() => (newTag = ''), 1);
  }
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
  <label for="tags" class="label">
    <span>Tags</span>
  </label>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
  {#each $form.tags as _, i}
    <input
      class="input"
      type="text"
      name="tags"
      bind:value={$form.tags[i]}
      data-invalid={$errors.tags?.[i]} />
    {#if $errors.tags?.[i]}<span class="text-red-500">{$errors.tags[i]}</span>{/if}
  {/each}

  <input
    class="input"
    type="text"
    placeholder="Add new tag..."
    bind:value={newTag}
    bind:this={newTagEl}
    on:change={() => addTag()} />

  {#if newTag}
    <input
      class="input"
      type="text"
      placeholder="Add new tag..."
      on:focus={() => newTagEl.focus()} />
  {/if}

  <div>
    <button type="submit" class="variant-filled btn">Submit</button>
  </div>
</form>
