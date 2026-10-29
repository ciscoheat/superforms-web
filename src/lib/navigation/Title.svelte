<script lang="ts">
  export let id: string | undefined = undefined;
</script>

<div {id} class="px-4 pt-6 font-bold uppercase text-primary-700 dark:text-primary-500">
  <slot />
</div>
