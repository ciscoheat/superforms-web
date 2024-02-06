<script lang="ts">
  import { Fireworks } from '@fireworks-js/svelte';
  import { onDestroy, onMount } from 'svelte';

  function moveFireworks() {
    const alert = document.querySelector('.alert');
    const box = alert?.getBoundingClientRect();
    if (!box) return;

    const container = document.querySelector<HTMLDivElement>('.fireworks');
    if (!container) return;
    container.style.left = box.left + 'px';
    container.style.top = box.top + 'px';

    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.height = box.height;
    canvas.width = box.width;
  }

  onMount(() => {
    moveFireworks();
    document.querySelector('#page')?.addEventListener('scroll', moveFireworks);
  });

  onDestroy(() => {
    document
      .querySelector('#page')
      ?.removeEventListener('scroll', moveFireworks);
  });
</script>

<svelte:window on:resize={moveFireworks} />

<aside class="alert mt-2">
  <div class="alert-message text-center">
    <strong>Superforms version 2</strong> has just been released, supporting all
    possible validation libraries. Find out
    <a href="/whats-new-v2">what's new</a>
    and see
    <a href="/migration-v2">how to migrate</a> your existing projects!
  </div>
  <Fireworks options={{ intensity: 5 }} class="fireworks" />
</aside>

<style lang="scss">
  :global(.fireworks) {
    position: absolute;
    margin: 0 !important;
    padding: 0 !important;
  }

  .alert-message {
    z-index: 1;
  }
</style>
