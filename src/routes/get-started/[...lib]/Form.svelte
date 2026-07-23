<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { untrack } from 'svelte';

  export function formData() {
    return form;
  }

  export let data: PageData;
  const { form, errors, enhance } = superForm(
    untrack(() => data.form),
    {
      taintedMessage: null
    }
  );
</script>

<form
  method="POST"
  action="/get-started"
  class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
  use:enhance>
  <label class="label">
    <span>Name</span>
    <input class="input" type="text" name="name" bind:value={$form.name} />
  </label>

  <label class="label">
    <span>E-mail</span>
    <input class="input" type="text" name="email" bind:value={$form.email} />
  </label>

  <button type="submit" class="variant-filled btn">Submit</button>
</form>
