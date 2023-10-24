<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, allErrors, enhance, message, constraints } = superForm(
    data.form,
    {
      taintedMessage: null,
      clearOnSubmit: 'none'
    }
  );
</script>

<form
  method="POST"
  action={$page.url.pathname}
  class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  {#if $allErrors.length}
    <ul class="list m-0 p-0">
      {#each $allErrors as error}
        <li class="m-0 p-0">
          <span class="flex-auto"><b>{error.path}:</b> {error.messages}</span>
        </li>
      {/each}
    </ul>
  {/if}
  {#if $message}
    <h3 data-toc-ignore class="mt-0 rounded bg-green-700 p-2">{$message}</h3>
  {/if}
  <label class="label">
    <span
      >Name {#if $constraints.name?.required}*{/if}</span>
    <input
      class="input"
      type="text"
      name="name"
      bind:value={$form.name}
      aria-invalid={$errors.name ? 'true' : undefined} />
  </label>

  <label class="label">
    <span
      >E-mail {#if $constraints.email?.required}*{/if}</span>
    <input
      class="input"
      type="text"
      name="email"
      bind:value={$form.email}
      aria-invalid={$errors.email ? 'true' : undefined} />
  </label>

  <button type="submit" class="variant-filled btn">Submit</button>
</form>
