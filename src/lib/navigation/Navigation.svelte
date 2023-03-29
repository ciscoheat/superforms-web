<script lang="ts">
  import { onMount } from 'svelte';
  import { drawerStore } from '@skeletonlabs/skeleton';
  import A from './A.svelte';
  import Title from './Title.svelte';

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
</script>

<nav class="list-nav p-4" bind:this={nav}>
  <ul>
    <li><A href="/">Home</A></li>
    <li><A href="/get-started">Get started</A></li>
    <li><A href="/api">API</A></li>

    <Title id="concepts">Concepts</Title>

    <li><A href="/again">Discussions</A></li>
    <li><A href="/faq">FAQ</A></li>
  </ul>
</nav>

<style lang="scss">
  ul > li > ul {
    margin-left: 16px;
  }
</style>
