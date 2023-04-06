<script lang="ts">
  import { Modal, modalStore } from '@skeletonlabs/skeleton';
  import magnify from '$lib/assets/magnify.svg?raw';

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

  // Local
  let searchTerm = '';
  let listPos = -1;
  let navigation: Array<{ title: string; url: string; hash: string }> = [];

  $: console.log(listPos);

  // Elements
  let elemDocSearch: HTMLElement;
  let searchInput: HTMLInputElement;

  async function onSearch() {
    if (searchTerm.length == 0) navigation = [];

    if (searchTerm.length < 2) return;
    const response = await fetch('/search?q=' + encodeURIComponent(searchTerm));
    const data = await response.json();

    if (Array.isArray(data)) navigation = data;
    else navigation = [];
  }

  function searchResultsKeyDown(event: KeyboardEvent) {
    const results = Array.from(
      elemDocSearch.querySelectorAll('[data-result-link]')
    );

    const currentIndex = document.activeElement
      ? results.indexOf(document.activeElement)
      : -1;

    if (currentIndex == -1) return;

    if (event.code == 'Backspace') {
      //event.preventDefault();
      searchInput.focus();
      //searchInput.value = searchInput.value.slice(0, -1);
      return;
    }

    const offset =
      event.code == 'ArrowDown' ? 1 : event.code == 'ArrowUp' ? -1 : 0;

    if (offset === 0) return;

    event.preventDefault();

    const next = results.at(
      currentIndex == 0 && offset == -1
        ? results.length - 1
        : currentIndex - results.length + offset
    );
    if (next instanceof HTMLAnchorElement) next.focus();
  }

  function searchFieldKeyDown(event: KeyboardEvent) {
    let anchor: Element | null | undefined;

    if (['Enter', 'ArrowDown'].includes(event.code)) {
      anchor = elemDocSearch.querySelector('[data-result-link]');
    } else if (['ArrowUp'].includes(event.code)) {
      const anchors = Array.from(
        elemDocSearch.querySelectorAll('[data-result-link]')
      );
      anchor = anchors[anchors.length - 1];
    }

    if (anchor && anchor instanceof HTMLAnchorElement) {
      event.preventDefault();
      anchor.focus();
    }
  }
</script>

<div bind:this={elemDocSearch} class="modal-search {cBase}">
  <!-- Header -->
  <header class="modal-search-header {cHeader}">
    <span class="text-xl ml-4 w-8">{@html magnify}</span>
    <input
      class={cSearchInput}
      bind:this={searchInput}
      bind:value={searchTerm}
      type="search"
      placeholder="Search..."
      on:input={onSearch}
      on:keydown={searchFieldKeyDown} />
  </header>
  <!-- Results -->
  <div
    class="modal-search-results {cResults}"
    on:keydown={searchResultsKeyDown}>
    <nav class="list-nav">
      <ul>
        <!-- Item -->
        {#each navigation as link}
          <li class="text-lg">
            <!-- prettier-ignore -->
            <a data-result-link class={cResultAnchor} href={link.url + (link.hash ? `#${link.hash}` : '')} on:click={() => { modalStore.close(); }}>
								<div class="flex items-center gap-4">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" 
                    d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6m0 2h7v5h5v11H6V4m2"/>
                  </svg>
									<span class="flex-auto font-bold opacity-75">{link.title}</span>
								</div>
								<span class="hidden md:block text-xs opacity-50">{link.url}</span>
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
