<script lang="ts">
  let packageManager = 'pnpm i -D';
  let validator = '';
</script>

<div class="flex items-center gap-1">
  <span>I'm using</span>
  <select class="select w-24" bind:value={packageManager}>
    <option value="pnpm i -D">pnpm</option>
    <option value="npm i -D">npm</option>
    <option value="yarn add --dev">yarn</option>
  </select>
  <span>and my validation library is</span>
  <select class="select w-28" bind:value={validator}>
    <option value="">Choose:</option>
    <option value="arktype">Arktype</option>
    <option value="joi">Joi</option>
    <option value="@sinclair/typebox">TypeBox</option>
    <option value="valibot">Valibot</option>
    <option value="yup">Yup</option>
    <option value="zod">Zod</option>
  </select>
</div>

<pre class="language-bash copy-visible"><code class="language-bash"
    >{packageManager} sveltekit-superforms@alpha {validator}</code></pre>
