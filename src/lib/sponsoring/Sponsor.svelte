<script lang="ts">
  import github from '$lib/assets/github.svg?raw';
  import kofi from '$lib/assets/ko-fi.svg?raw';
  import buymeacoffee from '$lib/assets/buymeacoffee.svg?raw';
  import paypal from '$lib/assets/paypal.svg?raw';
</script>

<div class="sponsoring">
  <a href="https://github.com/sponsors/ciscoheat" target="_blank">
    <div class="w-9"><div class="w-8">{@html github}</div></div>
    <div class="variant-ghost btn">Donate on Github</div>
  </a>

  <a href="https://ko-fi.com/ciscoheat" target="_blank">
    <div class="w-9">{@html kofi}</div>
    <div class="variant-ghost btn">Donate on Ko-fi</div>
  </a>

  <a href="https://buymeacoffee.com/ciscoheat" target="_blank">
    <div class="w-9">{@html buymeacoffee}</div>
    <div class="variant-ghost btn">Donate on Buymeacoffee</div>
  </a>

  <form
    class="mt-0"
    action="https://www.paypal.com/donate"
    method="POST"
    target="_top">
    <input type="hidden" name="hosted_button_id" value="NY7F5ALHHSVQS" />
    <button type="submit" class="w-9 text-primary-500">{@html paypal}</button>
    <button type="submit" class="variant-ghost btn text-primary-500"
      >Donate with Paypal</button>
  </form>
</div>

<style lang="scss">
  .sponsoring {
    a,
    form {
      padding-top: 4px;
      padding-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none !important;
      width: min-content;
    }
  }
</style>
