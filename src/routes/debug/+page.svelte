<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
  $: browser = data.browser;
</script>

{#key browser}
  <h3>{browser.path}</h3>
{/key}

<pre>
{#each browser.dirs as dir}<a
      class="dir"
      href="?dir={browser.path}{browser.sep}{dir}">{dir}</a
    ><br />{/each}{#each browser.files as file}<span class="file">{file}</span
    ><br />{/each}
</pre>

<style lang="scss">
  a {
    text-decoration: none !important;
  }
  .dir {
    color: chartreuse !important;
  }
  .file {
    color: peru;
  }
</style>
