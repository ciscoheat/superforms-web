<script lang="ts">
  import { goto } from '$app/navigation';
  import { getSettings } from '$lib/settings';

  const settings = getSettings();
</script>

<div class="items-center gap-1 sm:flex">
  <span class="whitespace-nowrap">I'm using</span>
  <select class="select w-24 max-w-24 py-1" bind:value={$settings.pm}>
    <option value="npm i -D">npm</option>
    <option value="pnpm i -D">pnpm</option>
    <option value="yarn add --dev">yarn</option>
  </select>
  <span class="whitespace-nowrap">and my validation library is</span>
  <select
    class="select w-40 max-w-40 py-1"
    bind:value={$settings.lib}
    on:input={(e) =>
      goto('/get-started/' + e.currentTarget.value, {
        replaceState: true,
        invalidateAll: true
      })}>
    <option value="">Choose:</option>
    <option value="ajv">Ajv</option>
    <option value="arktype">Arktype</option>
    <option value="joi">Joi</option>
    <option value="json-schema">JSON Schema</option>
    <option value="superstruct">Superstruct</option>
    <option value="@sinclair/typebox">TypeBox</option>
    <option value="valibot">Valibot</option>
    <option value="@vinejs/vine">VineJS</option>
    <option value="yup">Yup</option>
    <option value="zod">Zod</option>
    <option value="n/a">Not on the list!</option>
  </select>
</div>

{#if $settings.lib == 'ajv'}
  <aside class="alert variant-ghost mt-2">
    <div class="alert-message">
      Ajv is not available due to ESM incompatibility and tree-shaking issues. JSON Schema is
      recommended as an alternative.
    </div>
  </aside>
{:else if $settings.lib == 'n/a'}
  <aside class="alert variant-ghost mt-2">
    <div class="alert-message">
      Missing your favorite library? Writing an adapter for a library is usually no problem. Let me
      know on <a href="https://discord.gg/g5GHjGtU2W">Discord</a> or
      <a href="https://github.com/ciscoheat/sveltekit-superforms/issues">Github</a>!
    </div>
  </aside>
{:else}
  <pre class="installer language-bash copy-visible"><code class="language-bash"
      >{$settings.pm} sveltekit-superforms {$settings.lib == 'json-schema'
        ? '@exodus/schemasafe'
        : $settings.lib}</code></pre>
{/if}

<style lang="scss">
  select {
    max-width: 160px !important;
  }

  :global(.copy-content) {
    visibility: visible !important;
  }
</style>
