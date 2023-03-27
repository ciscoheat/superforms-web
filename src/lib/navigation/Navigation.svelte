<script lang="ts">
	import { onMount } from 'svelte';
	import { drawerStore } from '@skeletonlabs/skeleton';

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
		<li><a href="/">Homepage</a></li>
		<li><a href="/test">Test</a></li>
		<li><a href="/about">About</a></li>
	</ul>
</nav>
