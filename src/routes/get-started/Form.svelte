<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: PageData;

	const { form, errors, enhance } = superForm(data.form);
</script>

<h1>sveltekit-superforms</h1>

<form method="POST" action="/get-started" class="space-y-4" use:enhance>
	<label class="label">
		<span>Name</span>
		<input class="input" type="text" name="name" bind:value={$form.name} />
		{#if $errors.name}
			<span class="ml-1 text-red-500">{$errors.name}</span>
		{/if}
	</label>

	<label class="label">
		<span>E-mail</span>
		<input class="input" type="text" name="email" bind:value={$form.email} />
		{#if $errors.email}
			<span class="ml-1 text-red-500">{$errors.email}</span>
		{/if}
	</label>

	<button type="submit" class="btn variant-filled">Submit</button>
</form>
