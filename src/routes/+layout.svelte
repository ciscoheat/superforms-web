<script lang="ts">
  // The ordering of these imports is critical to your app working properly
  import '../theme.postcss';
  // If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
  import '@skeletonlabs/skeleton/styles/all.css';
  // Most of your app wide CSS should be put in this file
  import '../app.postcss';
  import { AppShell, AppBar, TableOfContents } from '@skeletonlabs/skeleton';
  import logo from '$lib/assets/logo.svg';
  import Navigation from '$lib/navigation/Navigation.svelte';
  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
  import { page } from '$app/stores';
  import '$lib/assets/prism-gruvbox-dark.css';
  import { afterNavigate } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { clickOutside } from '$lib/clickOutside';

  let hideSponsor = true;

  function drawerOpen(): void {
    drawerStore.open({});
  }

  const noToC = ['/'];
  $: ToC = !noToC.includes($page.url.pathname);

  afterNavigate((nav) => {
    if (nav.type == 'link') {
      document.getElementById('page')?.scrollTo(0, 0);
    }
  });
</script>

<svelte:head>
  <title>Superforms for SvelteKit</title>
</svelte:head>

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
              <img class="logo" src={logo} alt="Superforms logo" />
            </span>
          </button>
          <img
            class="logo mr-3 hidden lg:block"
            src={logo}
            alt="Superforms logo"
          />
          <strong class="text-lg md:text-xl truncate">Superforms</strong>
        </div>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <a
          href="https://discord.gg/AptebvVuhB"
          target="_blank"
          rel="noreferrer"
          class="mr-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            ><path
              fill="currentColor"
              fill-rule="evenodd"
              d="M5.075 1.826a.48.48 0 0 0-.127-.003c-.841.091-2.121.545-2.877.955a.48.48 0 0 0-.132.106c-.314.359-.599.944-.822 1.498C.887 4.95.697 5.55.59 5.984C.236 7.394.043 9.087.017 10.693a.48.48 0 0 0 .056.23c.3.573.947 1.104 1.595 1.492c.655.393 1.42.703 2.036.763a.48.48 0 0 0 .399-.153c.154-.167.416-.557.614-.86c.09-.138.175-.27.241-.375c.662.12 1.492.19 2.542.19c1.048 0 1.878-.07 2.54-.19c.066.106.15.237.24.374c.198.304.46.694.615.861a.48.48 0 0 0 .399.153c.616-.06 1.38-.37 2.035-.763c.648-.388 1.295-.919 1.596-1.492a.48.48 0 0 0 .055-.23c-.025-1.606-.219-3.3-.571-4.71a12.98 12.98 0 0 0-.529-1.601c-.223-.554-.508-1.14-.821-1.498a.48.48 0 0 0-.133-.106c-.755-.41-2.035-.864-2.877-.955a.48.48 0 0 0-.126.003a1.18 1.18 0 0 0-.515.238a2.905 2.905 0 0 0-.794.999A14.046 14.046 0 0 0 7.5 3.02c-.402 0-.774.015-1.117.042a2.905 2.905 0 0 0-.794-.998a1.18 1.18 0 0 0-.514-.238Zm5.943 9.712a23.136 23.136 0 0 0 .433.643c.396-.09.901-.3 1.385-.59c.543-.325.974-.7 1.182-1.017c-.033-1.506-.219-3.07-.54-4.358a12.046 12.046 0 0 0-.488-1.475c-.2-.498-.415-.92-.602-1.162c-.65-.337-1.675-.693-2.343-.79a.603.603 0 0 0-.058.04a1.5 1.5 0 0 0-.226.22a2.52 2.52 0 0 0-.113.145c.305.056.577.123.818.197c.684.21 1.177.5 1.418.821a.48.48 0 1 1-.768.576c-.059-.078-.316-.29-.932-.48c-.595-.182-1.47-.328-2.684-.328c-1.214 0-2.09.146-2.684.329c-.616.19-.873.4-.932.479a.48.48 0 1 1-.768-.576c.241-.322.734-.61 1.418-.82c.24-.075.512-.141.816-.197a2.213 2.213 0 0 0-.114-.146a1.5 1.5 0 0 0-.225-.22a.604.604 0 0 0-.059-.04c-.667.097-1.692.453-2.342.79c-.188.243-.402.664-.603 1.162c-.213.53-.39 1.087-.487 1.475c-.322 1.288-.508 2.852-.54 4.358c.208.318.638.692 1.181 1.018c.485.29.989.5 1.386.589a16.32 16.32 0 0 0 .433-.643c-.785-.279-1.206-.662-1.48-1.072a.48.48 0 0 1 .8-.532c.26.392.944 1.086 4.2 1.086c3.257 0 3.94-.694 4.2-1.086a.48.48 0 0 1 .8.532c-.274.41-.696.794-1.482 1.072ZM4.08 7.012c.244-.262.575-.41.92-.412c.345.002.676.15.92.412c.243.263.38.618.38.988s-.137.725-.38.988c-.244.262-.575.41-.92.412a1.263 1.263 0 0 1-.92-.412A1.453 1.453 0 0 1 3.7 8c0-.37.137-.725.38-.988ZM10 6.6c-.345.002-.676.15-.92.412c-.243.263-.38.618-.38.988s.137.725.38.988c.244.262.575.41.92.412c.345-.002.676-.15.92-.412c.243-.263.38-.618.38-.988s-.137-.725-.38-.988A1.263 1.263 0 0 0 10 6.6Z"
              clip-rule="evenodd"
            /></svg
          >
        </a>
        <a
          href="https://github.com/ciscoheat/sveltekit-superforms"
          class="md:pr-2"
          target="_blank"
          rel="noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            /></svg
          >
        </a>
        <button
          type="button"
          class="sponsor btn btn-sm variant-ghost relative"
          on:click={() => (hideSponsor = !hideSponsor)}
        >
          <span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35Z"
              /></svg
            ></span
          >
          <span class="hidden md:inline">Sponsor</span>
        </button>
      </svelte:fragment>
    </AppBar>
    {#if !hideSponsor}
      <div
        transition:fade={{ duration: 150 }}
        class="sponsor card absolute p-4 flex flex-col justify-end gap-3 h-48 md:h-40"
        use:clickOutside={{
          event: () => (hideSponsor = !hideSponsor),
          ignore: '.sponsor.btn'
        }}
      >
        <div class="sm:block md:hidden text-center">Sponsor</div>
        <a
          href="https://github.com/sponsors/ciscoheat"
          target="_blank"
          class="btn btn-sm variant-ghost"
        >
          <span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"
              /></svg
            ></span
          >
          <span>Github</span>
        </a>
        <a
          href="https://ko-fi.com/ciscoheat"
          target="_blank"
          class="btn btn-sm variant-ghost"
        >
          <span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M5 2h2v3H5zm4 0h2v3H9zm4 0h2v3h-2zm6 7h-2V7H3v11c0 1.654 1.346 3 3 3h8c1.654 0 3-1.346 3-3h2c1.103 0 2-.897 2-2v-5c0-1.103-.897-2-2-2zm-4 9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9h10v9zm2-2v-5h2l.002 5H17z"
              /></svg
            ></span
          >
          <span>Ko-fi</span>
        </a>
      </div>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="sidebarLeft">
    <Navigation />
  </svelte:fragment>
  <!-- Page Route Content -->
  <slot />
  <svelte:fragment slot="sidebarRight">
    {#key $page.url.pathname}
      <TableOfContents
        width="w-56"
        class="{ToC ? 'hidden md:block' : 'hidden'} p-4"
        target="#page"
      />
    {/key}
  </svelte:fragment>
</AppShell>

<style lang="scss">
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
</style>
