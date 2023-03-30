<script lang="ts" context="module">
  import ol from './ol.svelte';
  import table from './table.svelte';
  export { ol, table };
</script>

<script lang="ts">
  export let fullWidth = false;
</script>

<div
  class="p-6 md:p-10 space-y-5 {fullWidth
    ? ''
    : 'max-w-4xl'} mx-auto prose prose-invert"
>
  <slot />
</div>
