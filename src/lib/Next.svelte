<script lang="ts">
  import { page } from '$app/stores';
  export let section: [string, string][];

  $: nextIndex = section.findIndex(([url]) => $page.url.pathname == url) + 1;
  $: prevIndex = section.findIndex(([url]) => $page.url.pathname == url) - 1;
</script>

<div class="grid auto-cols-fr grid-flow-col gap-x-4 pt-8">
  {#if prevIndex >= 0}
    {@const previous = section[prevIndex]}
    <a class="card card-hover block p-4" href={previous[0]}>
      <small>Previous page</small><br />
      <span class="text-primary-500">← {previous[1]}</span>
    </a>
  {:else}
    <div />
  {/if}
  {#if nextIndex < section.length}
    {@const next = section[nextIndex]}
    <a class="card card-hover block p-4 text-right" href={next[0]}>
      <small>Next page</small><br />
      <span class="text-primary-500">{next[1]} →</span>
    </a>
  {:else}
    <div />
  {/if}
</div>
