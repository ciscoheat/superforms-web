<ol class="ml-6 md-list list space-y-0">
  <slot />
</ol>

<style lang="scss">
  :global(ol.md-list li) {
    display: list-item;
    flex-wrap: wrap;
    list-style-type: auto;
  }
</style>
