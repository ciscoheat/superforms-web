<script lang="ts">
  import type { Writable } from 'svelte/store';

  export let form: Writable<{ name: string }>;
</script>

<div>
  Change name here, to see it update in the SuperDebug instances:
  <input class="input" type="text" bind:value={$form.name} />
</div>
