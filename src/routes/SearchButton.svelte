<script lang="ts">
  import { browser } from '$app/environment';
  import { modalStore, type ModalSettings } from '@skeletonlabs/skeleton';
  import magnify from '$lib/assets/magnify.svg?raw';

  export let cls = '';
  export let width = '';
  export let buttonStyle = '';

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
    id="search-button"
    class="btn p-2 px-4 space-x-4 variant-soft variant-soft-primary {width} {buttonStyle}"
    on:click={triggerSearch}>
    <span class="w-6">{@html magnify}</span>
    <span class="inline-block badge variant-soft"
      >{isOsMac ? '⌘' : 'Ctrl'}+K</span>
  </button>
</div>

<style lang="scss">
  * {
    color: #a59639 !important;
  }

  #search-button:focus {
    background-color: #5a521f !important;
  }
</style>
