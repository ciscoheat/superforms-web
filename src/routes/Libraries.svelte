<script lang="ts">
  import arktype from '$lib/assets/libs/arktype_small.png';
  import joi from '$lib/assets/libs/joi_small.png';
  import typebox from '$lib/assets/libs/typebox_small.png';
  import valibot from '$lib/assets/libs/valibot_small.png';
  import vine from '$lib/assets/libs/vinejs_small.png';
  import zod from '$lib/assets/libs/zod_small.png';

  const links = [
    ['arktype', 'Arktype', arktype],
    ['joi', 'Joi', joi],
    ['@sinclair/typebox', 'TypeBox', typebox],
    ['valibot', 'Valibot', valibot],
    ['@vinejs/vine', 'VineJS', vine],
    ['yup', 'Yup'],
    ['zod', 'Zod', zod]
  ];
</script>

<div class="mb-4 flex flex-wrap justify-center gap-2">
  {#each links as link}
    <a class="variant-ghost btn no-underline" href="/get-started/{link[0]}"
      >{#if link[2]}<img
          class="m-0 mr-2 max-h-5 p-0"
          alt={link[1]}
          src={link[2]} />{/if}{link[1]}</a>
  {/each}
</div>
