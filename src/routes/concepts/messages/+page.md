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

A status message like "Form posted" can be displayed after submitting a form. The validation object contains a `message` store used for this:

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

However, we need to send it from the server first. Using the `message` function makes this rather simple.

## The message helper

```ts
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(schema));

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

You can return any type with the message, like an object, if you want to send more information than a string:

```ts
return message(form, { text: 'User created', id: newId })
```

See right below for how to make this data strongly typed.

> A successful form action in SvelteKit can only return status code `200`, so the status option for `message` must be in the range `400-599`, otherwise `{ form }` will be returned with a status of `200`, no matter what the status option is set to.

## Strongly typed message

The message is of type `any` by default, but you can type it using the `superValidate` type parameters:

```ts
import { type Infer, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

// Inferred schema type as first parameter, message type second
const form = await superValidate<Infer<typeof schema>, string>(event, zod(schema));
```

A string can be a bit limiting though; more realistically, there will be some kind of status for the form submission, so making a `Message` type can be useful for consistency.

```ts
import { type Infer, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

type Message = { status: 'error' | 'success' | 'warning'; text: string };

const form = await superValidate<Infer<typeof schema>, Message>(event, zod(schema));
```

To simplify this even further, if you have the same type for all status messages across the project, you can add a `Message` type to the `App.Superforms` namespace in src/app.d.ts, and it will be automatically set, no need for generic type parameters:

**src/app.d.ts**

```ts
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
    namespace Superforms {
      type Message = {
        type: 'error' | 'success', text: string
      }
    }
  }
}
```

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

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

Though if you want to keep it simple with a string or the default `any`, you can use `$page.status` to style the message appropriately:

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form, message } = superForm(data.form);
</script>

{#if $message}
  <div 
    class:success={$page.status == 200} 
    class:error={$page.status >= 400}
  >
    {$message}
  </div>
{/if}
```

### Using the message data programmatically

If you return data that you want to use programmatically instead of just displaying it, like in a toast message, you can do that in the [onUpdate](/concepts/events#onupdate) or [onUpdated](/concepts/events#onupdated) event:

```ts
return message(form, { status: 'success', text: 'All went well' });
```

```ts
const { form, enhance } = superForm(data.form, {
  onUpdated({ form }) {
    if (form.message) {
      // Display the message using a toast library
      toast(form.message.text, {
        icon: form.message.status == 'success' ? '✅' : '❌'
      });
    }
  }
});
```

The difference between the two events is that you can modify and cancel the update in `onUpdate`, compared to `onUpdated`, where the form data, errors, etc have already updated, making it best for non-store-related things like displaying a toast.

## Limitations

Since there is no form data returned when redirecting, in that case the message will be lost. It's quite common to redirect after a successful post, so the `message` property isn't a general solution for displaying status messages.

The library [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message) is a complete solution that works with redirects, however. It can be directly integrated into Superforms, [documented here](/flash-messages).

<Next section={concepts} />
