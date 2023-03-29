<script lang="ts">
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import debug from '$lib/assets/debug.svg?raw';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  export let data: any;
  export let open = false;
  export let label = 'Toggle SuperDebug';
  export let status = true;
</script>

<div class="card p-2">
  <Accordion hover="hover:bg-secondary-900">
    <AccordionItem {open}>
      <svelte:fragment slot="lead">{@html debug}</svelte:fragment>
      <svelte:fragment slot="summary">{label}</svelte:fragment>
      <svelte:fragment slot="content"
        ><SuperDebug {status} {data} /></svelte:fragment
      >
    </AccordionItem>
  </Accordion>
</div>
