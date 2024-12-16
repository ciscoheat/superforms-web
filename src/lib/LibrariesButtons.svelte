<script lang="ts">
  import arktype from '$lib/assets/libs/arktype_small.png';
  import classvalidator from '$lib/assets/libs/classvalidator_small.png';
  import effect from '$lib/assets/libs/effect_small.png';
  import joi from '$lib/assets/libs/joi_small.png';
  import typebox from '$lib/assets/libs/typebox_small.png';
  import valibot from '$lib/assets/libs/valibot_small.png';
  import vine from '$lib/assets/libs/vinejs_small.png';
  import zod from '$lib/assets/libs/zod_small.png';
  import jsonSchema from '$lib/assets/libs/json-schema_small.png';
  import superstruct from '$lib/assets/libs/superstruct_small.png';

  export let url: string;
  export let name: 'adapter' | 'package' = 'package';
  export let target: undefined | '_blank';

  while (url.endsWith('/')) url = url.slice(0, -1);

  const links = [
    { packageName: 'arktype', adapterName: 'arktype', showName: 'Arktype', icon: arktype },
    { packageName: 'class-validator', showName: 'class-validator', icon: classvalidator },
    { packageName: 'effect', showName: 'Effect', icon: effect },
    { packageName: 'joi', adapterName: 'joi', showName: 'Joi', icon: joi },
    {
      packageName: 'json-schema',
      adapterName: 'json-schema',
      showName: 'JSON Schema',
      icon: jsonSchema
    },
    {
      packageName: 'superstruct',
      adapterName: 'superstruct',
      showName: 'Superstruct',
      icon: superstruct
    },
    {
      packageName: '@sinclair/typebox',
      adapterName: 'typebox',
      showName: 'TypeBox',
      icon: typebox
    },
    { packageName: 'valibot', adapterName: 'valibot', showName: 'Valibot', icon: valibot },
    { packageName: '@vinejs/vine', adapterName: 'vine', showName: 'VineJS', icon: vine },
    { packageName: 'yup', adapterName: 'yup', showName: 'Yup' },
    { packageName: 'zod', adapterName: 'zod', showName: 'Zod', icon: zod }
  ] satisfies {
    packageName: string;
    adapterName?: string;
    showName: string;
    icon?: string;
  }[];
</script>

<div class="mb-4 flex flex-wrap justify-center gap-2">
  {#each links as link}
    {@const libName = name == 'package' ? link.packageName : link.adapterName}
    {#if libName}
      <a class="variant-ghost btn no-underline" href="{url}/{libName}" {target}
        >{#if link.icon}<img
            class="m-0 mr-2 max-h-5 p-0"
            alt={link.showName}
            src={link.icon} />{/if}{link.showName}</a>
    {/if}
  {/each}
</div>
