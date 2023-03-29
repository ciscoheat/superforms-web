<script lang="ts">
	import { page } from '$app/stores';

	export let href: string;
	$: current = $page.url.pathname == href;
</script>

<a class:bg-primary-active-token={current} {href} {...$$props}><slot /></a>
