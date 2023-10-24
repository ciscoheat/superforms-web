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
    taintedMessage: null,
    onUpdate({ form }) {
      console.log('SPA post', form);
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
  class="mb-3 space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  <input type="hidden" name="id" bind:value={$form.id} />

  {#if $message}
    <h3 data-toc-ignore class="mt-0 rounded bg-green-700 p-2">{$message}</h3>
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

  <button type="submit" class="variant-filled btn">Submit</button>
</form>
