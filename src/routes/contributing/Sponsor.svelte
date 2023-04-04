<script lang="ts">
  import github from '$lib/assets/github.svg?raw';
  import kofi from '$lib/assets/ko-fi.svg?raw';
</script>

<div>
  <a class="mb-5" href="https://github.com/sponsors/ciscoheat" target="_blank">
    <div class="w-9"><div class="w-8">{@html github}</div></div>
    <div class="btn variant-ghost">Sponsor Superforms on Github</div>
  </a>

  <a href="https://ko-fi.com/ciscoheat" target="_blank">
    <div class="w-9">{@html kofi}</div>
    <div class="btn variant-ghost">Sponsor Superforms on Ko-fi</div>
  </a>
</div>

<style lang="scss">
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    width: min-content;
  }
</style>
