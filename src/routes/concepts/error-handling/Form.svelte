<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, allErrors, enhance, tainted, message, constraints } =
    superForm(data.form, {
      taintedMessage: null
    });
</script>

<form
  method="POST"
  action={$page.url.pathname}
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
  use:enhance>
  {#if $allErrors.length}
    <ul class="list m-0 p-0">
      {#each $allErrors as error}
        <li class="m-0 p-0">
          <span class="flex-auto"><b>{error.path}:</b> {error.message}</span>
        </li>
      {/each}
    </ul>
  {/if}
  {#if $message}
    <h3 class="rounded p-2 bg-green-700">{$message}</h3>
  {/if}
  <label class="label">
    <span
      >Name {#if $constraints.name?.required}*{/if}</span>
    <input
      class="input"
      type="text"
      name="name"
      bind:value={$form.name}
      data-invalid={$errors.name} />
  </label>

  <label class="label">
    <span
      >E-mail {#if $constraints.email?.required}*{/if}</span>
    <input
      class="input"
      type="text"
      name="email"
      bind:value={$form.email}
      data-invalid={$errors.email} />
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
