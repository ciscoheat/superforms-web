<script lang="ts">
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import debug from '$lib/assets/debug.svg?raw';

  export let open = false;
  $: label = (open ? 'Hide' : 'Display')  + ' variables';
</script>

<div class="card p-2">
  <Accordion hover="hover:bg-secondary-900">
    <AccordionItem {open}>
      <svelte:fragment slot="lead">{@html debug}</svelte:fragment>
      <svelte:fragment slot="summary">{label}</svelte:fragment>
      <svelte:fragment slot="content"
        ><pre>--sd-bg-color
--sd-label-color
--sd-promise-loading-color
--sd-promise-rejected-color
--sd-code-default
--sd-info
--sd-success
--sd-redirect
--sd-error
--sd-code-key
--sd-code-string
--sd-code-date
--sd-code-boolean
--sd-code-number
--sd-code-bigint
--sd-code-null
--sd-code-nan
--sd-code-undefined
--sd-code-function
--sd-code-symbol
--sd-code-error
--sd-sb-width
--sd-sb-height
--sd-sb-track-color
--sd-sb-track-color-focus
--sd-sb-thumb-color
--sd-sb-thumb-color-focus</pre>
      </svelte:fragment>
    </AccordionItem>
  </Accordion>
</div>

<style>
  pre {
    color: rgb(170, 171, 179) !important;
    background-color: transparent !important;
    padding: 0 !important;
  }
</style>
