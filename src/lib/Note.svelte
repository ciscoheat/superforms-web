<aside class="alert variant-filled-surface pb-0 pt-5 mb-5 font-medium">
  <slot />
</aside>

<style lang="scss">
  :global(aside.alert > p::before) {
    content: '💥 ';
  }
</style>
