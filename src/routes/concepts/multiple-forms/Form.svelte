<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { page } from '$app/stores';
  import Debug from '$lib/Debug.svelte';

  export let data: PageData;
  const {
    form: register,
    errors: errors1,
    enhance: enhance1,
    message: message1
  } = superForm(data.registerForm, {
    resetForm: true,
    invalidateAll: false,
    taintedMessage: null
  });

  const {
    form: login,
    errors: errors2,
    enhance: enhance2,
    message: message2
  } = superForm(data.loginForm, {
    resetForm: true,
    invalidateAll: false,
    taintedMessage: null
  });
</script>

<Debug data={{ $register, $login }} />

<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <form
    method="POST"
    action="{$page.url.pathname}?/register"
    class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
    use:enhance1>
    <h3 data-toc-ignore class="mt-0">Register user</h3>
    {#if $message1}
      <h4 data-toc-ignore class="rounded bg-green-700 p-2">{$message1}</h4>
    {/if}
    <label class="label">
      <span>Name</span>
      <input
        class="input"
        type="text"
        name="name"
        bind:value={$register.name} />
      {#if $errors1.name}<span class="text-red-500">{$errors1.name}</span>{/if}
    </label>

    <label class="label">
      <span>E-mail</span>
      <input
        class="input"
        type="email"
        name="email"
        bind:value={$register.email} />
      {#if $errors1.email}<span class="text-red-500">{$errors1.email}</span
        >{/if}
    </label>

    <label class="label">
      <span>Password</span>
      <input
        class="input"
        type="password"
        name="pwd"
        autocomplete="new-password"
        bind:value={$register.pwd} />
      {#if $errors1.pwd}<span class="text-red-500">{$errors1.pwd}</span>{/if}
    </label>

    <button type="submit" class="variant-filled btn">Submit</button>
  </form>

  <form
    method="POST"
    action="{$page.url.pathname}?/login"
    class="space-y-4 rounded-xl border-2 border-dashed border-primary-900 bg-slate-900 p-5"
    use:enhance2>
    <h3 data-toc-ignore class="mt-0">Login</h3>
    {#if $message2}
      <h4 data-toc-ignore class="rounded bg-green-700 p-2">{$message2}</h4>
    {/if}

    <label class="label">
      <span>E-mail</span>
      <input
        class="input"
        type="email"
        name="email"
        autocomplete="off"
        bind:value={$login.email} />
      {#if $errors2.email}
        <span class="text-red-500">{$errors2.email}</span>
      {/if}
    </label>

    <label class="label">
      <span>Password</span>
      <input
        class="input"
        type="password"
        name="pwd"
        autocomplete="new-password"
        bind:value={$login.pwd} />
      {#if $errors2.pwd}<span class="text-red-500">{$errors2.pwd}</span>{/if}
    </label>

    <button type="submit" class="variant-filled btn">Submit</button>
  </form>
</div>
