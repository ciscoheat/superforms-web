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

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <form
    method="POST"
    action="{$page.url.pathname}?/register"
    class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
    use:enhance1>
    <h3>Register user</h3>
    {#if $message1}
      <h4 class="rounded p-2 bg-green-700">{$message1}</h4>
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

    <button type="submit" class="btn variant-filled">Submit</button>
  </form>

  <form
    method="POST"
    action="{$page.url.pathname}?/login"
    class="p-5 border-dashed bg-slate-900 border-2 border-primary-900 rounded-xl space-y-4"
    use:enhance2>
    <h3>Login</h3>
    {#if $message2}
      <h4 class="rounded p-2 bg-green-700">{$message2}</h4>
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

    <button type="submit" class="btn variant-filled">Submit</button>
  </form>
</div>
