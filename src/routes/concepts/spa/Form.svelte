<script lang="ts">
  import type { PageData } from './$types';
  import {
    superForm,
    message as setMessage,
    setError
  } from 'sveltekit-superforms/client';
  import { _userSchema } from './+page';

  export let data: PageData;

  const { form, errors, message, constraints, enhance, delayed } = superForm<
    typeof _userSchema
  >(data.form, {
    SPA: true,
    validators: _userSchema,
    onUpdate({ form }) {
      if (form.data.email.includes('spam')) {
        setError(form, 'email', 'Suspicious email address.');
      } else if (form.valid) {
        setMessage(form, 'Valid data!');
        // TODO: Do something with the validated data
      }
    },
    onError({ result, message }) {
      message.set(result.error.message);
    }
  });
</script>

<form
  method="POST"
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4 mb-3"
  use:enhance>
  <input type="hidden" name="id" bind:value={$form.id} />

  {#if $message}
    <h3 class="rounded p-2 bg-green-700">{$message}</h3>
  {/if}
  <label class="label">
    <span>Name</span>
    <input
      class="input"
      type="text"
      name="name"
      data-invalid={$errors.name}
      bind:value={$form.name} />
    {#if $errors.name}<span class="text-red-500">{$errors.name}</span>{/if}
  </label>

  <label class="label">
    <span>E-mail</span>
    <input
      class="input"
      type="text"
      name="email"
      data-invalid={$errors.email}
      bind:value={$form.email} />
    {#if $errors.email}<span class="text-red-500">{$errors.email}</span>{/if}
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
