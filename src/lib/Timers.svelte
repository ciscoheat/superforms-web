<script lang="ts">
	import { derived, type Readable } from 'svelte/store';

	export let submitting: Readable<boolean>;
	export let delayed: Readable<boolean>;
	export let timeout: Readable<boolean>;

	let time = derived(
		submitting,
		($s, set) => {
			let timer: Date | undefined = undefined;
			const interval = setInterval(() => {
				if (!$submitting) timer = undefined;
				else if (!timer) timer = new Date();
				let output = timer ? Date.now() - timer.getTime() + 'ms' : '';
				output = output.padEnd(6);
				set(output);
			}, 1);

			return () => clearInterval(interval);
		},
		'      '
	);
</script>

<pre><span class:green={!$submitting}>Idle</span> -> <span class:green={$submitting}
		>submitting</span
	> -> <span class:green={$delayed}>delayed</span> -> <span class:green={$timeout}>timeout</span>
{$time}  <span class:green={$submitting}>0 ms</span>          <span class:green={$delayed}
		>500 ms</span
	>     <span class:green={$timeout}>8000 ms</span>
</pre>

<style lang="scss">
	pre {
		span {
			color: rgb(227, 56, 56);
			&.green {
				color: rgb(55, 200, 55);
			}
		}
		font-size: 130%;
		margin: 40px 0;
	}
</style>
