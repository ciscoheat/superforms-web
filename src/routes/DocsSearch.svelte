<script lang="ts">
  import { modalStore, drawerStore } from '@skeletonlabs/skeleton';
  import magnify from '$lib/assets/magnify.svg?raw';
  import { debounce } from 'throttle-debounce';
  import { onDestroy, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  // Classes
  const cBase =
    'card bg-surface-100/60 dark:bg-surface-500/30 backdrop-blur-lg overflow-hidden w-full max-w-[800px] shadow-xl mt-8 mb-auto';
  const cHeader = 'bg-surface-300-600-token flex items-center';
  const cSearchInput =
    'bg-transparent border-0 ring-0 focus:ring-0 w-full p-4 text-lg';
  const cResults = 'overflow-x-auto max-h-[480px] hide-scrollbar';
  const cResultAnchor =
    '!rounded-none justify-between hover:variant-soft focus:!variant-filled-primary outline-0';
  const cFooter =
    'hidden md:flex items-center gap-2 bg-surface-300-600-token p-4 text-xs font-bold';

  export let results: Writable<{
    term: string;
    results: Array<{ title: string; url: string; hash: string }>;
  }>;

  // Elements
  let docSearch: HTMLElement;
  let searchInput: HTMLInputElement;

  const search = debounce(150, async function search(e: Event) {
    const searchTerm = $results.term;
    if (searchTerm.length < 2) return;

    const response = await fetch('/search?q=' + encodeURIComponent(searchTerm));
    const data = await response.json();

    results.set({
      term: $results.term,
      results: Array.isArray(data) ? data : []
    });
  });

  const eventName = 'keydown';

  modalStore.subscribe(async (modals) => {
    if (modals.length && modals[0].component == 'search') {
      const search = document.getElementById('search-input');
      if (search) (search as HTMLInputElement).select();
    }
  });

  onMount(() => {
    window.addEventListener(eventName, docSearchKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener(eventName, docSearchKeyDown);
  });

  function currentListIndex(list?: ReturnType<typeof searchList>) {
    return Math.max(
      0,
      (list ?? searchList()).indexOf(document.activeElement as HTMLInputElement)
    );
  }

  function searchList() {
    return [
      searchInput,
      ...Array.from(
        docSearch.querySelectorAll<HTMLAnchorElement>('[data-result-link]')
      )
    ];
  }

  function docSearchKeyDown(e: KeyboardEvent) {
    if (e.code == 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    const list = searchList();
    const current = currentListIndex(list);

    //console.log(current, e.code, e.target, e.currentTarget);

    function focusOn(index: number | -1) {
      e.preventDefault();
      list[index == -1 ? list.length - 1 : index]?.focus();
    }

    if (current === 0 && list.length > 1) {
      if (e.code === 'ArrowUp') {
        focusOn(-1);
      } else if (e.code === 'ArrowDown' || e.code === 'Enter') {
        focusOn(1);
      }
    } else if (e.code === 'ArrowUp' && e.target === list[1]) {
      focusOn(0);
    } else if (e.code === 'ArrowDown' && e.target === list[list.length - 1]) {
      focusOn(0);
    } else if (e.code == 'Backspace') {
      list[0].focus();
    }
  }

  function close() {
    modalStore.close();
  }
</script>

<div bind:this={docSearch} class="modal-search {cBase}">
  <!-- Header -->
  <header class="modal-search-header {cHeader}">
    <span class="text-xl ml-4 w-8">{@html magnify}</span>
    <input
      id="search-input"
      class={cSearchInput}
      bind:this={searchInput}
      bind:value={$results.term}
      on:input={search}
      type="search"
      placeholder="Search..." />
  </header>
  <!-- Results -->
  <div class="modal-search-results {cResults}">
    <nav class="list-nav">
      <ul>
        <!-- Item -->
        {#each $results.results as link}
          <li class="text-lg">
            <!-- prettier-ignore -->
            <a data-result-link class={cResultAnchor} href={link.url + (link.hash ? `#${link.hash}` : '')} on:click={() => { close(); drawerStore.close() }}>
              <div class="flex items-center gap-4 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" 
                  d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6m0 2h7v5h5v11H6V4m2"/>
                </svg>
                <div class="flex flex-auto justify-between items-center opacity-75">
                  <div class="font-bold w-full">{link.title} <span class="hidden md:inline text-sm opacity-50 font-normal">{link.url}</span></div>
                  <!--div class="hidden md:block text-sm opacity-50">{link.url}</div-->
                </div>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
  <!-- Footer -->
  <footer class="modal-search-footer {cFooter}">
    <div><kbd>Esc</kbd> to close</div>
    <div><kbd>↓</kbd><kbd>↑</kbd> to navigate</div>
    <div><kbd>Enter</kbd> to select</div>
  </footer>
</div>
