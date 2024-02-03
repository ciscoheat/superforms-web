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
  <select class="select w-36 max-w-36" bind:value={$settings.lib}>
    <option value="">Choose:</option>
    <option value="ajv">Ajv</option>
    <option value="arktype">Arktype</option>
    <option value="joi">Joi</option>
    <option value="superstruct">Superstruct</option>
    <option value="@sinclair/typebox">TypeBox</option>
    <option value="valibot">Valibot</option>
    <option value="yup">Yup</option>
    <option value="zod">Zod</option>
  </select>
</div>

{#if $settings.lib == 'ajv'}
  <aside class="alert variant-ghost mt-2">
    <div class="alert-message">
      Ajv is not available due to ESM incompatibility and tree-shaking issues.
      TypeBox is recommended as an alternative.
    </div>
  </aside>
{:else if $settings.lib == 'superstruct'}
  <aside class="alert variant-ghost mt-2">
    <div class="alert-message">
      Superstruct is not yet available due to a <a
        href="https://github.com/ianstormtaylor/superstruct/issues/1200"
        target="_blank">moduleResolution problem</a
      >.
    </div>
  </aside>
{:else}
  <pre class="installer language-bash copy-visible"><code class="language-bash"
      >{$settings.pm} sveltekit-superforms {$settings.lib}</code></pre>
{/if}

<style lang="scss">
  select {
    max-width: 142px !important;
  }

  :global(.copy-content) {
    visibility: visible !important;
  }
</style>
