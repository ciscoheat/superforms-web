<script lang="ts">
  import { Fireworks } from '@fireworks-js/svelte';
  import type { FireworksOptions } from '@fireworks-js/svelte';
  import { onMount } from 'svelte';

  let fw: Fireworks;

  const options = {
    intensity: 5
  } satisfies FireworksOptions;

  function resized() {
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

  onMount(resized);
</script>

<svelte:window on:resize={resized} />

<aside class="alert mt-2">
  <div class="alert-message text-center">
    <strong>Superforms version 2</strong> has just been released, supporting all
    possible validation libraries. Find out
    <a href="/whats-new-v2">what's new</a>
    and see
    <a href="/migration-v2">how to migrate</a> your existing projects!
  </div>
  <Fireworks bind:this={fw} {options} class="fireworks" />
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
