<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# Rate limiting

<Head title="Rate limiting with sveltekit-rate-limiter" />

Superforms has a basic [client-side prevention](/concepts/submit-behavior#multiplesubmits) of multiple form submissions. But you may want to limit the rate of form submissions on the server as well, to prevent misuse and spamming. 

A useful library for this is [sveltekit-rate-limiter](https://github.com/ciscoheat/sveltekit-rate-limiter), which makes it easy to rate limit password resets, account registration, etc. It not only works with forms but all requests, so API limiting is another use for it. With this library, basic rate limiting isn't much harder than:

```ts
import { error } from '@sveltejs/kit';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

const limiter = new RateLimiter({
  IP: [10, 'h'], // IP address limiter
  IPUA: [5, 'm'], // IP + User Agent limiter
});

export const actions = {
  default: async (event) => {
    // Every call to isLimited counts as a hit towards the rate limit for the event.
    if (await limiter.isLimited(event)) error(429);
  }
};
```

It can be easily expanded with custom limiter plugins and different stores than the built-in ones.

Installation and usage instructions are available at its Github repo: https://github.com/ciscoheat/sveltekit-rate-limiter
