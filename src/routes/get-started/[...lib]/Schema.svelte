<script lang="ts">
  import { getSettings } from '$lib/settings';

  const settings = getSettings();
</script>

<div class="flex items-center gap-1">
  <span>I'm using</span>
  <select class="select w-24 max-w-24" bind:value={$settings.pm}>
    <option value="npm i -D">npm</option>
    <option value="pnpm i -D">pnpm</option>
    <option value="yarn add --dev">yarn</option>
  </select>
  <span>and my validation library is</span>
  <select class="select w-28 max-w-28" bind:value={$settings.lib}>
    <option value="">Choose:</option>
    <option value="ajv">Ajv</option>
    <option value="arktype">Arktype</option>
    <option value="joi">Joi</option>
    <option value="@sinclair/typebox">TypeBox</option>
    <option value="valibot">Valibot</option>
    <option value="yup">Yup</option>
    <option value="zod">Zod</option>
  </select>
</div>

{#if $settings.lib == 'ajv'}
  <aside class="alert variant-ghost-primary mt-2">
    <div class="alert-message">
      Ajv is not yet available due to ESM incompatibility.
    </div>
  </aside>
{:else}
  <pre class="installer language-bash copy-visible"><code class="language-bash"
      >{$settings.pm} sveltekit-superforms {$settings.lib}</code></pre>
{/if}

<style lang="scss">
  select {
    max-width: 112px !important;
  }

  :global(.copy-content) {
    visibility: visible !important;
  }
</style>
