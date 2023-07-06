<script lang="ts">
  import github from '$lib/assets/github.svg?raw';
  import kofi from '$lib/assets/ko-fi.svg?raw';
  import buymeacoffee from '$lib/assets/buymeacoffee.svg?raw';
  import paypal from '$lib/assets/paypal.svg?raw';
</script>

<p>
  Now that version 1.0 is released, there will be bug fixes, more support
  questions on the Discord server, future features to work on, and so on.
</p>
<p>
  If you're using Superforms in non-profit circumstances, the library is
  completely free; a star on Github is more than enough if you want to give your
  support. But if you are using Superforms in a commercial project, would you or
  the company you work for consider donating?
</p>
<p>
  If you have appreciated my support on <a href="https://discord.gg/AptebvVuhB"
    >Discord</a>
  and <a href="https://github.com/ciscoheat/sveltekit-superforms">Github</a>, or
  want to ensure that things keep rolling, please support open source software
  in this way.
</p>

<div class="sponsoring">
  <a href="https://github.com/sponsors/ciscoheat" target="_blank">
    <div class="w-9"><div class="w-8">{@html github}</div></div>
    <div class="btn variant-ghost">Sponsor Superforms on Github</div>
  </a>

  <a href="https://ko-fi.com/ciscoheat" target="_blank">
    <div class="w-9">{@html kofi}</div>
    <div class="btn variant-ghost">Sponsor Superforms on Ko-fi</div>
  </a>

  <a href="https://buymeacoffee.com/ciscoheat" target="_blank">
    <div class="w-9">{@html buymeacoffee}</div>
    <div class="btn variant-ghost">Sponsor Superforms on Buymeacoffee</div>
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
  .sponsoring {
    a,
    form {
      padding-top: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none !important;
      width: min-content;
    }
  }
</style>
