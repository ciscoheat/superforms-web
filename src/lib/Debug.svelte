<script lang="ts">
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import debug from '$lib/assets/debug.svg?raw';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  export let data: any;
</script>

{#if data}
  <div class="card p-4">
    <Accordion hover="hover:bg-secondary-900">
      <AccordionItem>
        <svelte:fragment slot="lead">{@html debug}</svelte:fragment>
        <svelte:fragment slot="summary">Toggle SuperDebug</svelte:fragment>
        <svelte:fragment slot="content"><SuperDebug {data} /></svelte:fragment>
      </AccordionItem>
    </Accordion>
  </div>
{/if}
