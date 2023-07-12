<script lang="ts">
  export let title: string;
</script>

<svelte:head>
  <meta property="og:title" content={title} />
  <title>{title}</title>
</svelte:head>
