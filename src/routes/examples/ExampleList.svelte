<script lang="ts">
  import { examples as allExamples, tags } from './examples.js';
  import github from '$lib/assets/github.svg?raw';
  import { page } from '$app/stores';
  import { replaceState } from '$app/navigation';

  let filter = new Set<string>($page.url.searchParams.getAll('tag'));

  $: examples = filter.size
    ? allExamples.filter((e) => e.tags.some((tag) => filter.has(tag)))
    : allExamples;

  function toggleTag(tag: string) {
    if (tag) {
      filter.has(tag) ? filter.delete(tag) : filter.add(tag);
    }

    filter = filter;

    const url = new URL($page.url);
    url.searchParams.delete('tag');
    filter.forEach((tag) => url.searchParams.append('tag', tag));
    replaceState(url, {});
  }

  const bgDark = ['multi-step-skeleton', 'custom-client'];
</script>

<div class="mb-2 flex min-h-10 items-center">
  <span>Click to filter by tags:</span>
  {#if filter.size}<button
      on:click={() => {
        filter = new Set();
        toggleTag('');
      }}
      class="variant-filled btn btn-sm ml-2">Clear filters</button
    >{/if}
</div>

<div class="flex flex-wrap gap-2">
  {#each tags as tag}
    {@const filtered = filter.has(tag)}
    <button
      on:click={() => toggleTag(tag)}
      class:variant-ghost={!filtered}
      class:variant-filled-success={filtered}
      class="chip">{tag}</button>
  {/each}
</div>

<div class="examples my-4 flex flex-wrap justify-center gap-x-4">
  {#each examples as example}
    <div class="example card variant-filled-surface w-full sm:w-1/3 md:w-60">
      <header
        class="{bgDark.includes(example.slug)
          ? undefined
          : 'example-white-bg'} card-header h-32 p-0 sm:h-32">
        <img
          alt="Example"
          src="/examples/{example.slug}.png"
          class="m-0 h-32 w-full object-contain p-0 sm:h-32" />
      </header>
      <section class="p-4 pb-0">
        <p>{example.description}</p>
        <p>
          {#each example.libs as lib, i}
            <a
              href="https://sveltelab.dev/github.com/ciscoheat/superforms-examples/tree/{example.slug}-{lib}"
              target="_blank"
              >{#if example.libs.length == 1}Open example{:else}{lib.slice(0, 1).toUpperCase() +
                  lib.slice(1)}{/if}
            </a>
            <a
              href="https://github.com/ciscoheat/superforms-examples/tree/{example.slug}-{lib}"
              target="_blank"><!-- eslint-disable svelte/no-at-html-tags -->{@html github}</a>
            {#if i < example.libs.length - 1}<span class="px-1"><br /></span>{/if}
          {/each}
        </p>
      </section>
      <footer class="card-footer self-end">
        <div class="flex flex-wrap gap-1">
          {#each example.tags as tag}
            {@const filtered = filter.has(tag)}
            <button
              on:click={() => toggleTag(tag)}
              class:variant-filled-success={filtered}
              class:variant-ghost-success={!filtered}
              class="chip">{tag}</button>
          {/each}
        </div>
      </footer>
    </div>
  {/each}
</div>

<p class="text-center">
  Send a message <a href="https://discord.gg/g5GHjGtU2W" target="_blank">on Discord</a> if you have an
  idea of something else that should be included!
</p>

<style>
  :global(main) {
    overflow-y: scroll;
  }

  img,
  header {
    border-top-left-radius: var(--theme-rounded-container);
    border-top-right-radius: var(--theme-rounded-container);
  }

  .example-white-bg {
    background-color: #fafafa;
  }

  :global(.examples .example svg) {
    width: 18px;
    height: 18px;
    display: inline;
    margin-left: 3px;
    color: white;
  }
</style>
