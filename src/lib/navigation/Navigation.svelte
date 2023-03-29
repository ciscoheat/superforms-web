<script lang="ts">
	import { onMount } from 'svelte';
	import { drawerStore } from '@skeletonlabs/skeleton';
	import A from './A.svelte';

	function drawerClose(): void {
		drawerStore.close();
	}

	let nav: HTMLElement;

	onMount(() => {
		nav.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (target && target.tagName == 'A') {
				drawerClose();
			}
		});
	});
</script>

<nav class="list-nav p-4" bind:this={nav}>
	<ul>
		<li><A href="/">Start</A></li>
		<li><A href="/tutorial">Tutorial</A></li>

		<div id="title" class="pt-4 text-primary-700 dark:text-primary-500 font-bold uppercase px-4">
			Title
		</div>

		<li><A href="/api">API</A></li>
		<li><A href="/again">Discussions</A></li>
		<li><A href="/faq">FAQ</A></li>
	</ul>
</nav>

<style lang="scss">
	ul > li > ul {
		margin-left: 16px;
	}
</style>
