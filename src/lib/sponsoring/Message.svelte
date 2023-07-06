<script lang="ts">
  import { page } from '$app/stores';
  import confetti from 'canvas-confetti';
  import { onMount, tick } from 'svelte';

  $: cancel = $page.url.searchParams.has('cancel');
  $: success = $page.url.searchParams.has('success');

  onMount(async () => {
    if (success) {
      await tick();
      confetti({ particleCount: 75, spread: 80, ticks: 250 });
    }
  });
</script>

<div
  class:variant-filled-success={success}
  class:variant-ghost-primary={cancel}
  class:hidden={!cancel && !success}
  class="alert alert-message pb-0 mb-5 font-medium">
  {#if cancel}
    <p>
      Your donation was cancelled. Nothing has been deducted from your account.
    </p>
  {:else if success}
    <p>
      Thank you so much for donating to improve support and the continued
      development of Superforms!
    </p>
  {/if}
</div>
