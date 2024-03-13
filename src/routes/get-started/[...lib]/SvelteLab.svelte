<script lang="ts">
  export let lib: string;
  $: libName = lib == '@sinclair/typebox' ? 'typebox' : lib == '@vinejs/vine' ? 'vine' : lib;
</script>

<p>
  Alternatively, <a
    href="https://sveltelab.dev/github.com/ciscoheat/superforms-examples/tree/tutorial-{libName}"
    target="_blank">open the tutorial on SvelteLab</a> to follow along in the browser and copy the code
  from there.
</p>
