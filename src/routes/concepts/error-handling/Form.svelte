<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, allErrors, enhance, tainted, message, constraints } =
    superForm(data.form);
</script>

<form
  method="POST"
  action={$page.url.pathname}
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
  use:enhance
>
  {#if $allErrors}
    <ul class="list">
      {#each $allErrors as error}
        <li>
          <span class="text-red-500"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8z"
              /></svg
            ></span
          >
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
      >Name {#if $constraints.name?.required}*{/if}</span
    >
    <input
      class="input"
      type="text"
      name="name"
      bind:value={$form.name}
      data-invalid={$errors.name}
    />
  </label>

  <label class="label">
    <span
      >E-mail {#if $constraints.email?.required}*{/if}</span
    >
    <input
      class="input"
      type="text"
      name="email"
      bind:value={$form.email}
      data-invalid={$errors.email}
    />
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
