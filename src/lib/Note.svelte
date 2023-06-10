<aside class="alert variant-filled-surface pb-0 pt-5 mb-5 font-medium">
  <slot />
</aside>

<style lang="scss">
  :global(aside.alert) {
    border: 1px solid #b7a73f;
  }

  :global(aside.alert > p) {
    margin-left: 1.5rem;
  }

  :global(aside.alert > p::before) {
    content: '💥 ';
    margin-left: -1.75rem;
  }
</style>
