<script lang="ts">
  import { browser } from '$app/environment';
  import { modalStore, type ModalSettings } from '@skeletonlabs/skeleton';

  export let cls = '';
  export let width = '';

  function triggerSearch(): void {
    const d: ModalSettings = {
      type: 'component',
      component: 'search',
      position: 'item-start'
    };
    modalStore.trigger(d);
  }

  let isOsMac = false;
  if (browser) {
    let os = navigator.userAgent;
    isOsMac = os.search('Mac') !== -1;
  }
</script>

<!-- Search -->
<div class={cls}>
  <button
    class="btn p-2 px-4 space-x-4 variant-soft hover:variant-soft-primary {width}"
    on:click={triggerSearch}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5Z" /></svg>
    <span class="inline-block badge variant-soft"
      >{isOsMac ? '⌘' : 'Ctrl'}+K</span>
  </button>
</div>

<style lang="scss">
  * {
    color: #a59639 !important;
  }
</style>
