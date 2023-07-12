# Rate limiting

<svelte:head><title>Rate limiting with sveltekit-rate-limiter</title></svelte:head>

Superforms has a basic [client-side prevention](/concepts/submit-behavior#multiplesubmits) of multiple form submissions. But you may want to limit the rate of form submissions on the server as well, to prevent misuse and spamming. 

A useful library for this is [sveltekit-rate-limiter](https://github.com/ciscoheat/sveltekit-rate-limiter), which makes it easy to rate limit password resets, account registration, etc. It not only works with forms but all requests, so API limiting is another use for it.

Installation and usage instructions are available at its Github repo:<br>https://github.com/ciscoheat/sveltekit-rate-limiter
