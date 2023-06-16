<script lang="ts">
  // The ordering of these imports is critical to your app working properly
  import '../theme.postcss';
  // If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
  import '@skeletonlabs/skeleton/styles/all.css';
  // Most of your app wide CSS should be put in this file
  import '../app.postcss';
  import { AppShell, AppBar, TableOfContents } from '@skeletonlabs/skeleton';
  import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
  import { Modal, modalStore } from '@skeletonlabs/skeleton';

  import Navigation from '$lib/navigation/Navigation.svelte';
  import { page } from '$app/stores';
  import '$lib/assets/prism-gruvbox-dark.css';
  import { beforeNavigate, afterNavigate } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { clickOutside } from '$lib/clickOutside';

  import DocsSearch from './DocsSearch.svelte';

  import logo from '$lib/assets/logo.svg';
  import github from '$lib/assets/github.svg?raw';
  import kofi from '$lib/assets/ko-fi.svg?raw';
  import paypal from '$lib/assets/paypal.svg?raw';
  import buymeacoffee from '$lib/assets/buymeacoffee.svg?raw';
  import SearchButton from './SearchButton.svelte';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import copy from 'clipboard-copy';

  // Local
  let hideSponsor = true;

  async function drawerOpen() {
    drawerStore.open({});
    await tick();
    if (document.activeElement?.id === 'search-button') {
      (document.activeElement as HTMLButtonElement).blur();
    }
  }

  const modalRegistry: Record<string, ModalComponent> = {
    search: {
      ref: DocsSearch,
      props: {
        results: writable({ term: '', results: [] })
      }
    }
  };

  function triggerSearch(): void {
    const d: ModalSettings = {
      type: 'component',
      component: 'search',
      position: 'item-start'
    };
    modalStore.trigger(d);
  }

  // Keyboard Shortcut (CTRL/⌘+K) to Focus Search
  function onWindowKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      // Prevent default browser behavior of focusing URL bar
      e.preventDefault();
      // If modal currently open, close modal (allows to open/close search with CTRL/⌘+K)
      $modalStore.length ? modalStore.close() : triggerSearch();
    }
  }

  const noToC = ['/'];
  $: displayToC = !noToC.includes($page.url.pathname);

  beforeNavigate((nav) => {
    if (nav.type == 'form') return;
    document
      .querySelectorAll('.copy-content')
      .forEach((el) => el.removeEventListener('click', copyContent));
  });

  afterNavigate((nav) => {
    if (nav.type == 'link') {
      // If linked to a page, sometimes it won't scroll to the top.
      const id = nav.to?.url.hash ? nav.to.url.hash.slice(1) : 'page';
      document.getElementById(id)?.scrollTo(0, 0);
    } else if (nav.type == 'enter' && $page.url.hash) {
      const el = document.getElementById($page.url.hash.substring(1));
      if (el) el.scrollIntoView();
    }

    if (nav.type != 'form') {
      copyBoxes();
    }
  });

  const checkedIcon =
    '<path fill="currentColor" d="m10.6 16.2l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4l4.25 4.25ZM5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.588 1.413T19 21H5Zm0-2h14V5H5v14ZM5 5v14V5Z"/>';

  async function copyContent(e: Event) {
    if (!e.target) return;
    const parent = (e.target as HTMLElement).closest('pre');
    if (!parent) return;

    const codeEl = parent.querySelector('code');
    const svg = parent.querySelector('.copy-content svg');

    if (codeEl) {
      await copy(codeEl.innerText);
      if (svg) {
        const oldContent = svg.innerHTML;
        svg.innerHTML = checkedIcon;
        setTimeout(() => (svg.innerHTML = oldContent), 800);
      }
    }
  }

  function copyBoxes() {
    document
      .querySelectorAll<HTMLElement>('pre:not(.super-debug--pre) > code')
      .forEach((el) => {
        const pre = el.parentElement as HTMLPreElement;
        var copy = document.createElement('div');
        copy.classList.add('copy-content');
        copy.addEventListener('click', copyContent);

        copy.innerHTML =
          '<button type="button"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Zm0-2h9V4H9v12Zm0 0V4v12Z"/></svg></button>';

        pre.prepend(copy);
      });
  }
</script>

<svelte:head>
  <title>Superforms for SvelteKit</title>
</svelte:head>

<svelte:window on:keydown|stopPropagation={onWindowKeydown} />

<Modal components={modalRegistry} />

<Drawer width="w-70">
  <h3 class="p-4">Navigation</h3>
  <hr />
  <Navigation />
</Drawer>
<!-- App Shell -->
<AppShell regionPage="shrink-0" slotSidebarLeft="bg-surface-500/5 w-0 lg:w-56">
  <svelte:fragment slot="header">
    <!-- App Bar -->
    <AppBar>
      <svelte:fragment slot="lead">
        <div class="flex shrink-0 items-center">
          <button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
            <span>
              <svg viewBox="0 0 100 80" class="hamburger w-4 h-4">
                <rect width="100" height="20" />
                <rect y="30" width="100" height="20" />
                <rect y="60" width="100" height="20" />
              </svg>
            </span>
          </button>
          <img
            class="logo mr-3 hidden lg:block"
            src={logo}
            alt="Superforms logo" />
          <strong class="text-lg md:text-xl truncate">Superforms</strong>
        </div>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <a
          class="mr-2"
          href="https://discord.gg/AptebvVuhB"
          target="_blank"
          rel="noreferrer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            ><path
              fill="currentColor"
              fill-rule="evenodd"
              d="M5.075 1.826a.48.48 0 0 0-.127-.003c-.841.091-2.121.545-2.877.955a.48.48 0 0 0-.132.106c-.314.359-.599.944-.822 1.498C.887 4.95.697 5.55.59 5.984C.236 7.394.043 9.087.017 10.693a.48.48 0 0 0 .056.23c.3.573.947 1.104 1.595 1.492c.655.393 1.42.703 2.036.763a.48.48 0 0 0 .399-.153c.154-.167.416-.557.614-.86c.09-.138.175-.27.241-.375c.662.12 1.492.19 2.542.19c1.048 0 1.878-.07 2.54-.19c.066.106.15.237.24.374c.198.304.46.694.615.861a.48.48 0 0 0 .399.153c.616-.06 1.38-.37 2.035-.763c.648-.388 1.295-.919 1.596-1.492a.48.48 0 0 0 .055-.23c-.025-1.606-.219-3.3-.571-4.71a12.98 12.98 0 0 0-.529-1.601c-.223-.554-.508-1.14-.821-1.498a.48.48 0 0 0-.133-.106c-.755-.41-2.035-.864-2.877-.955a.48.48 0 0 0-.126.003a1.18 1.18 0 0 0-.515.238a2.905 2.905 0 0 0-.794.999A14.046 14.046 0 0 0 7.5 3.02c-.402 0-.774.015-1.117.042a2.905 2.905 0 0 0-.794-.998a1.18 1.18 0 0 0-.514-.238Zm5.943 9.712a23.136 23.136 0 0 0 .433.643c.396-.09.901-.3 1.385-.59c.543-.325.974-.7 1.182-1.017c-.033-1.506-.219-3.07-.54-4.358a12.046 12.046 0 0 0-.488-1.475c-.2-.498-.415-.92-.602-1.162c-.65-.337-1.675-.693-2.343-.79a.603.603 0 0 0-.058.04a1.5 1.5 0 0 0-.226.22a2.52 2.52 0 0 0-.113.145c.305.056.577.123.818.197c.684.21 1.177.5 1.418.821a.48.48 0 1 1-.768.576c-.059-.078-.316-.29-.932-.48c-.595-.182-1.47-.328-2.684-.328c-1.214 0-2.09.146-2.684.329c-.616.19-.873.4-.932.479a.48.48 0 1 1-.768-.576c.241-.322.734-.61 1.418-.82c.24-.075.512-.141.816-.197a2.213 2.213 0 0 0-.114-.146a1.5 1.5 0 0 0-.225-.22a.604.604 0 0 0-.059-.04c-.667.097-1.692.453-2.342.79c-.188.243-.402.664-.603 1.162c-.213.53-.39 1.087-.487 1.475c-.322 1.288-.508 2.852-.54 4.358c.208.318.638.692 1.181 1.018c.485.29.989.5 1.386.589a16.32 16.32 0 0 0 .433-.643c-.785-.279-1.206-.662-1.48-1.072a.48.48 0 0 1 .8-.532c.26.392.944 1.086 4.2 1.086c3.257 0 3.94-.694 4.2-1.086a.48.48 0 0 1 .8.532c-.274.41-.696.794-1.482 1.072ZM4.08 7.012c.244-.262.575-.41.92-.412c.345.002.676.15.92.412c.243.263.38.618.38.988s-.137.725-.38.988c-.244.262-.575.41-.92.412a1.263 1.263 0 0 1-.92-.412A1.453 1.453 0 0 1 3.7 8c0-.37.137-.725.38-.988ZM10 6.6c-.345.002-.676.15-.92.412c-.243.263-.38.618-.38.988s.137.725.38.988c.244.262.575.41.92.412c.345-.002.676-.15.92-.412c.243-.263.38-.618.38-.988s-.137-.725-.38-.988A1.263 1.263 0 0 0 10 6.6Z"
              clip-rule="evenodd" /></svg>
        </a>
        <a
          href="https://github.com/ciscoheat/sveltekit-superforms"
          class="md:pr-2 w-7 md:w-8 text-primary-500"
          target="_blank"
          rel="noreferrer"
          >{@html github}
        </a>
        <SearchButton cls="hidden md:inline" />
        <button
          type="button"
          class="sponsor btn btn-sm variant-ghost relative"
          on:click={() => (hideSponsor = !hideSponsor)}>
          <span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35Z" /></svg
            ></span>
          <span class="hidden md:inline">Sponsor</span>
        </button>
      </svelte:fragment>
    </AppBar>
    {#if !hideSponsor}
      <div
        transition:fade={{ duration: 150 }}
        class="sponsor card absolute p-4 flex flex-col justify-end gap-3 h-50 md:h-64"
        use:clickOutside={{
          event: () => (hideSponsor = !hideSponsor),
          ignore: '.sponsor.btn'
        }}>
        <div class="relative -left-5 -top-1 w-28 md:hidden text-center">
          Sponsor
        </div>
        <a
          href="https://github.com/sponsors/ciscoheat"
          target="_blank"
          class="btn btn-sm variant-ghost">
          <span class="w-7 p-1 text-primary-500">{@html github}</span>
          <span>Github</span>
        </a>
        <a
          href="https://ko-fi.com/ciscoheat"
          target="_blank"
          class="btn btn-sm variant-ghost">
          <span class="w-6 p-0 text-primary-500">{@html kofi}</span>
          <span>Ko-fi</span>
        </a>
        <a
          href="https://buymeacoffee.com/ciscoheat"
          target="_blank"
          class="btn btn-sm variant-ghost">
          <span class="w-6 p-0 text-primary-500">{@html buymeacoffee}</span>
          <span>Buymeacoffee</span>
        </a>
        <form
          class="flex"
          action="https://www.paypal.com/donate"
          method="POST"
          target="_top">
          <input type="hidden" name="hosted_button_id" value="NY7F5ALHHSVQS" />
          <button type="submit" class="btn btn-sm variant-ghost w-full">
            <span class="w-6 p-0 text-primary-500">{@html paypal}</span>
            <span class="pr-3">Paypal</span>
          </button>
        </form>
      </div>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="sidebarLeft">
    <Navigation />
  </svelte:fragment>
  <!-- Page Route Content -->
  <div class="p-3 font-bold text-center bg-surface-500 fixed">
    This is the legacy documentation for Superforms 0.x. The 1.0 version can be
    found at <a href="https://superforms.rocks">superforms.rocks</a>!
  </div>
  <slot />
  <svelte:fragment slot="sidebarRight">
    {#key $page.url.pathname}
      <TableOfContents
        width="w-56"
        class="{displayToC ? 'hidden md:block' : 'hidden'} p-4"
        target="#page" />
    {/key}
  </svelte:fragment>
</AppShell>

<style lang="scss">
  .hamburger {
    fill: #b7a73f;
  }

  svg {
    color: #b7a73f;
    width: 24px;
    height: 24px;
  }

  img.logo {
    width: 36px;
    height: 36px;
  }

  .sponsor.btn {
    z-index: 4;
  }

  .sponsor.card {
    top: 10px;
    right: 5px;
  }

  :global(pre:hover .copy-content) {
    visibility: visible;
  }

  :global(.copy-content) {
    float: right;
    color: #84792e;
    visibility: hidden;
  }
</style>
