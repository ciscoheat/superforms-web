<script lang="ts">
  import type { InputConstraint } from 'sveltekit-superforms';

  export let value: string;
  export let errors: string[] | undefined;
  export let constraints: InputConstraint | undefined;
  export let label: string | undefined = undefined;
</script>

<label>
  {#if label}<span>{label}</span><br />{/if}
  <input
    bind:value
    type="date"
    aria-invalid={errors ? 'true' : undefined}
    {...constraints}
    min={constraints?.min?.toString().slice(0, 10)}
    max={constraints?.max?.toString().slice(0, 10)}
    {...$$restProps} />
</label>
{#if errors}<span class="invalid">{errors}</span>{/if}

<style>
  .invalid {
    color: red;
  }
</style>
