<script lang="ts">
  import multipleforms from '$lib/assets/gallery/multipleforms.png';
  import spinner from '$lib/assets/gallery/spinner.png';
  import api from '$lib/assets/gallery/api.png';
  import tainted from '$lib/assets/gallery/tainted.png';
  import clientvalidation from '$lib/assets/gallery/clientvalidation.png';
  import nesteddata from '$lib/assets/gallery/nesteddata.png';
  import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
  import { beforeNavigate } from '$app/navigation';

  const modalStore = getModalStore();

  const images = [
    [
      nesteddata,
      'Nested data',
      'Use any kind of <a href="/concepts/nested-data/">nested data structure</a> with Superforms. Coercion to and from Date, arrays, etc, is automatic.'
    ],
    [
      multipleforms,
      'Multiple forms on the same page',
      'Superforms handles <a href="/concepts/multiple-forms/">multiple forms</a> in a straightforward manner, without you having to worry about collisions in <code>PageData</code> and <code>ActionData</code>.'
    ],
    [
      tainted,
      'Tainted fields',
      'Prevent data loss by <a href="/concepts/tainted/">marking fields as tainted</a> and alerting the user, when navigating away from a modified form.'
    ],
    [
      clientvalidation,
      'Client-side validation',
      'Real time <a href="/concepts/client-validation/">client-side validation</a>, with automatic centering and <a href="/concepts/error-handling/#errorselector">focusing on error fields</a>.'
    ],
    [
      spinner,
      'Loading spinners',
      'Adding a loading spinner is literally <a href="/concepts/timers#loading-indicators">one line of code</a>. No need for extra variables or custom solutions, Superforms handles it for you.'
    ],
    [
      api,
      'All in a minimal API',
      'The API is simple to begin with, but can be expanded to handle advanced use cases with events, snapshots, error handling, single-page applications, and much more.'
    ]
  ];

  function showImage(i: number) {
    const alert: ModalSettings = {
      type: 'alert',
      image: images[i][0],
      title: images[i][1],
      body: images[i][2],
      buttonTextCancel: 'Close'
    };
    modalStore.trigger(alert);
  }

  beforeNavigate(() => {
    modalStore.close();
  });
</script>

<div class="mb-12 grid grid-cols-2 gap-y-8 md:grid-cols-3 md:gap-x-4">
  {#each images as image, i}
    <figure class="m-0 flex flex-col justify-end">
      <button type="button" on:click={() => showImage(i)}>
        <img class="m-0" alt="Multiple forms" src={image[0]} />
      </button>
      <figcaption class="text-center not-italic">{image[1]}</figcaption>
    </figure>
  {/each}
</div>

<style lang="scss">
  figure {
    //max-width: 300px;
    //max-height: 200px;

    img {
      //width: 300px;
      //height: 200px;
      object-fit: contain;
    }
  }

  :global(.modal-body a) {
    text-decoration: underline;
    color: rgb(var(--color-primary-500));
  }
</style>
