<script lang="ts">
  import { onMount } from 'svelte';
  import { drawerStore } from '@skeletonlabs/skeleton';
  import A from './A.svelte';
  import Title from './Title.svelte';
  import { page } from '$app/stores';
  import { concepts } from './sections';

  function drawerClose(): void {
    drawerStore.close();
  }

  let nav: HTMLElement;

  onMount(() => {
    nav.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName == 'A') {
        drawerClose();
      }
    });
  });

  $: active = $page.url.pathname;
</script>

<nav class="list-nav p-4" bind:this={nav}>
  <ul>
    <li><A href="/">Home</A></li>
    <li><A href="/get-started">Get started</A></li>
    <li><A href="/api">API</A></li>

    <Title id="concepts">Concepts</Title>

    {#each concepts as concept}
      <li><A href={concept[0]}>{concept[1]}</A></li>
    {/each}

    <Title id="concepts">Other topics</Title>

    <li><A href="/crud">CRUD tutorial</A></li>
    <li><A href="/default-values">Default values</A></li>
    <li><A href="/faq">FAQ</A></li>
    <li><A href="/flash-messages">Flash messages</A></li>
    <li><A href="/playground">Playground</A></li>
  </ul>
</nav>

<style lang="scss">
  ul > li > ul {
    margin-left: 16px;
  }
</style>
