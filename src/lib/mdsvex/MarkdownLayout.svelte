<script lang="ts" context="module">
  import ul from './ul.svelte';
  import li from './li.svelte';
  export { ul, li };
</script>

<script lang="ts">
  export let fullWidth = false;
</script>

<div class="p-6 md:p-10 space-y-5 {fullWidth ? '' : 'max-w-4xl'}">
  <slot />
</div>
