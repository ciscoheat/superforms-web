<script lang="ts" context="module">
  import ol from './ol.svelte';
  import table from './table.svelte';
  import blockquote from './blockquote.svelte';
  export { ol, table, blockquote };
</script>

<script lang="ts">
  export let fullWidth = false;
</script>

<div
  class="{fullWidth ? '' : 'max-w-4xl'} prose prose-invert mx-auto p-6 md:p-10">
  <slot />
</div>
