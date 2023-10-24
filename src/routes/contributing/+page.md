<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Sponsor from '$lib/sponsoring/Sponsor.svelte'
  import Message from '$lib/sponsoring/Message.svelte'
</script>

<Message />

<Head title="Contributing, donating and sponsoring" />

# Contributing

Contributions to Superforms are very welcome! The issues and discussion pages on [Github](https://github.com/ciscoheat/sveltekit-superforms) are always open for comments, and if you want to contribute some code, it's quite easy. Just fork either the [Superforms](https://github.com/ciscoheat/sveltekit-superforms) repository or its [website](https://github.com/ciscoheat/superforms-web), and then you just need to execute the following to be up and running:

```
npm install
npm run dev
```

```
pnpm install
pnpm dev
```

If you find a typo on the website, you can make a quick PR directly in its [Github repository](https://github.com/ciscoheat/superforms-web/tree/main/src/routes).

## Donations

<Sponsor />

Any $10 or more monthly donation will be listed on the [Sponsors](/sponsors) page with a picture and link!

## Voting on new features

You can give a thumbs up on the [Github issues](https://github.com/ciscoheat/sveltekit-superforms/issues) marked with "enhancement", and I will prioritize the ones with highest votes for the next feature release.
