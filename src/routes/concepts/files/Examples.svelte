<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
  let tabSet = 0;
</script>

<TabGroup>
  <Tab bind:group={tabSet} name="proxy" value={0}>Proxy method</Tab>
  <Tab bind:group={tabSet} name="input" value={1}>on:input</Tab>
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}<slot name="proxy" />
    {:else if tabSet === 1}<slot name="input" />{/if}
  </svelte:fragment>
</TabGroup>
