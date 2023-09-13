<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
  let tabSet = 0;
</script>

<TabGroup>
  <Tab bind:group={tabSet} name="Svelte 4" value={0}>Svelte 4</Tab>
  <Tab bind:group={tabSet} name="Svelte 3" value={1}>Svelte 3</Tab>
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}<slot name="svelte4" />
    {:else if tabSet === 1}<slot name="svelte3" />{/if}
  </svelte:fragment>
</TabGroup>
