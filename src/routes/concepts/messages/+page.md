<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Status messages

<Head title="Status messages" />

So far, almost every feature has been on the client! That's where the action is, but you may have noticed that a status message like "Form posted" is displayed when submitting the forms in the examples.

The validation object contains a `message` property used for this:

## Usage

```ts
const { form, message } = superForm(data.form);
```

It is used to display the message on the client, like any other store:

```svelte
{#if $message}
  <div class="message">{$message}</div>
{/if}
```

However, we need to send it from the server first. Using the `message` auxiliary function makes this rather simple.

## The message helper

```ts
import { message, superValidate } from 'sveltekit-superforms/server';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);

    if (!form.valid) {
      // Will return fail(400, { form }) since form isn't valid
      return message(form, 'Invalid form');
    }

    if (form.data.email.includes('spam')) {
      // Will also return fail, since status is >= 400
      // form.valid will also be set to false.
      return message(form, 'No spam please', {
        status: 403
      });
    }

    // Just returns { form } with the message (and status code 200).
    return message(form, 'Valid form!');
  }
};
```

> Note that a successful form action in SvelteKit can only return status code `200`, so the status option for `message` must be in the range `400-599`, otherwise `{ form }` will be returned with a status of `200`, no matter what the status option is set to.

## Strongly typed message

The `message` is of type `any` by default, but you can type it using `superValidate` type parameters:

```ts
const form = await superValidate<typeof schema, string>(event, schema);
```

A string can be a bit limiting though; more realistically, there will be some kind of status for the form submission, so making a `Message` type can be useful for consistency.

```ts
type Message = { status: 'error' | 'success' | 'warning'; text: string };

const form = await superValidate<typeof schema, Message>(event, schema);
```

```svelte
<script lang="ts">
  const { form, message } = superForm(data.form);
</script>

{#if $message}
  <div 
    class:success={$message.status == 'success'} 
    class:error={$message.status == 'error'}
  >
    {$message.text}
  </div>
{/if}
```

Though if you want to keep it simple with a string/any, you can use `$page.status` to style the message appropriately:

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  const { form, message } = superForm(data.form);
</script>

{#if $message}
  <div class:success={$page.status == 200} class:error={$page.status >= 400}>
    {$message}
  </div>
{/if}
```

### Using the message data programmatically

If you return data that you want to use programmatically instead of just displaying it, you can do that in the [onUpdated](/concepts/events#onupdated) event:

```ts
const { form, message, enhance } = superForm(data.form, {
  onUpdated() {
    if ($message) {
      // Display the message using a toast library
      toast($message.text, {
        icon: $message.status == 'success' ? '✅' : '❌'
      });
    }
  }
});
```

## Limitations

Naturally, redirects will cause the message to be lost. Since it's common to redirect after a successful post, the `message` property isn't a general solution for displaying status messages.

The library [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message#readme) is a complete solution that works with redirects, however. It can be directly integrated into Superforms, [documented here](/flash-messages).

<Next section={concepts} />
