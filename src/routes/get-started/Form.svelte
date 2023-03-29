<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';

  export function fd() {
    return form;
  }

  export let data: PageData;
  const { form, errors, enhance } = superForm(data.form);
</script>

<form
  method="POST"
  action="/get-started"
  class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
  use:enhance
>
  <label class="label">
    <span>Name</span>
    <input class="input" type="text" name="name" bind:value={$form.name} />
  </label>

  <label class="label">
    <span>E-mail</span>
    <input class="input" type="text" name="email" bind:value={$form.email} />
  </label>

  <button type="submit" class="btn variant-filled">Submit</button>
</form>
