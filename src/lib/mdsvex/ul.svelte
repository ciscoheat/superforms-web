<ul class="ml-6 md-list list space-y-0">
  <slot />
</ul>

<style lang="scss">
  :global(ul.md-list li) {
    flex-wrap: wrap;
    display: list-item;
    list-style-type: '💥';
  }
</style>
