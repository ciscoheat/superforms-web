<script lang="ts">
  export let id: string | undefined = undefined;
</script>

<div
  {id}
  class="pt-6 text-primary-700 dark:text-primary-500 font-bold uppercase px-4"
>
  <slot />
</div>
