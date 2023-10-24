<script lang="ts">
  import { browser } from '$app/environment';
  import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
  import magnify from '$lib/assets/magnify.svg?raw';

  export let cls = '';
  export let width = '';
  export let buttonStyle = '';

  const modalStore = getModalStore();

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
    class="variant-soft-primary variant-soft btn space-x-4 p-2 px-4 {width} {buttonStyle}"
    on:click={triggerSearch}>
    <span class="w-6">{@html magnify}</span>
    <span class="variant-soft badge inline-block"
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
