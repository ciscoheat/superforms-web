<script lang="ts">
  import github from '$lib/assets/github.svg?raw';
  import kofi from '$lib/assets/ko-fi.svg?raw';
  import paypal from '$lib/assets/paypal.svg?raw';
</script>

<div>
  <a href="https://github.com/sponsors/ciscoheat" target="_blank">
    <div class="w-9"><div class="w-8">{@html github}</div></div>
    <div class="btn variant-ghost">Sponsor Superforms on Github</div>
  </a>

  <a href="https://ko-fi.com/ciscoheat" target="_blank">
    <div class="w-9">{@html kofi}</div>
    <div class="btn variant-ghost">Sponsor Superforms on Ko-fi</div>
  </a>

  <form
    class="mt-0"
    action="https://www.paypal.com/donate"
    method="POST"
    target="_top">
    <input type="hidden" name="hosted_button_id" value="NY7F5ALHHSVQS" />
    <button type="submit" class="w-9 text-primary-500">{@html paypal}</button>
    <button type="submit" class="btn variant-ghost text-primary-500"
      >Sponsor Superforms with Paypal</button>
  </form>
</div>

<style lang="scss">
  a,
  form {
    padding-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    width: min-content;
  }
</style>
