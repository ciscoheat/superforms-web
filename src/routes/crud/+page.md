<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Youtube from '$lib/Youtube.svelte'
</script>

# Designing a CRUD interface

<Head title="CRUD tutorial" />

An excellent use case for Superforms is a backend interface, commonly used as in the acronym **CRUD** (Create, Read, Update, Delete):

1. Display an empty form
1. POST the form, validate the data
1. Create a new entity with the data **(Create)**
1. Fetch the entity **(Read)**
1. Display it in a form
1. POST the form, validate the data
1. Update the entity with the data **(Update)**
1. Delete the entity **(Delete)**
1. ???
1. Profit!

Because you can send the data model to the `superValidate` function and have the form directly populated, it becomes quite easy to implement the above steps.

## Getting started

To follow along, there are three ways:

### Video tutorial

Instead of the text version below, here's the video version.

<Youtube id="nN72awrXsHE" />

### Stackblitz

The code is available on [Stackblitz](https://stackblitz.com/edit/sveltekit-superforms-1-crud?file=src%2Froutes%2F%2Bpage.server.ts,src%2Froutes%2F%2Bpage.svelte); just click the link, and you're up and running in the browser in 15 seconds!

### New SvelteKit project

Start from scratch in a new SvelteKit project by executing one of the following commands in your project directory:

```
npm create svelte@latest
```

```
pnpm create svelte@latest
```

Select **Skeleton project** and **Typescript syntax** at the prompts, the rest is up to you. Then add this to `<head>` in **src/app.html** for a much nicer visual experience:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/normalize.css@8.0.1/normalize.css" />
<link rel="stylesheet" href="https://unpkg.com/sakura.css/css/sakura.css" />
```

## Start - Creating a test database

When you have the code up and running, we need data storage for testing. Refer to the [Zod schema reference](https://zod.dev/?id=primitives) for help with building a schema.

**src/lib/users.ts**

```ts
import { z } from 'zod';

// See https://zod.dev/?id=primitives for schema syntax
export const userSchema = z.object({
  id: z.string().regex(/^\d+$/),
  name: z.string().min(2),
  email: z.string().email()
});

type UserDB = z.infer<typeof userSchema>[];

// Let's worry about id collisions later
export const userId = () => String(Math.random()).slice(2);

// A simple user "database"
export const users: UserDB = [
  {
    id: userId(),
    name: 'Important Customer',
    email: 'important@example.com'
  },
  {
    id: userId(),
    name: 'Super Customer',
    email: 'super@example.com'
  }
];
```

This user database in the shape of an array will be helpful for testing our CRUD operations.

## Form vs. database schemas

When starting on the server page, we'll encounter a thing about validation schemas. The `userSchema` is for **database integrity**, so an `id` **must** exist there. But we want to create an entity, and must therefore allow `id` not to exist when creating users.

Fortunately, Zod makes it quite easy to append a modifier to a field without duplicating the whole schema by extending it:

**src/routes/users/[[id]]/+page.server.ts**

```ts
import { superValidate, message } from 'sveltekit-superforms/server';
import { error, fail, redirect } from '@sveltejs/kit';

import { users, userId, userSchema } from '$lib/users';

const crudSchema = userSchema.extend({
  id: userSchema.shape.id.optional()
});
```

(Of course, the original `userSchema` is kept intact.)

With this, **Create** and **Update** can now use the same schema, which means that they can share the same user interface. This is a fundamental idea in Superforms: you can pass either empty data or an entity partially matching the schema to `superValidate`, and it will generate default values for any non-specified fields, ensuring type safety.

## Reading a user from the database

Let's add a load function to the page, using the SvelteKit route parameters to look up the requested user:

**src/routes/+page.server.ts**

```ts
export const load = async ({ url }) => {
  // READ user
  const user = users.find((u) => u.id == params.id);

  if (params.id && !user) throw error(404, 'User not found.');

  // If user is null, default values for the schema will be returned.
  const form = await superValidate(user, crudSchema);
  return { form, users };
};
```

Some simple logic is used to find the user, and then detect if a 404 should be displayed. At the end, we're returning `form` as usual, but also `users`, so they can be displayed as a list.

(Sometimes, CRUDL is used as an acronym, since listing is also fundamental to data management.)

Now that we have loaded the data, let's display it in a page component:

**src/routes/users/[[id]]/+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { superForm } from 'sveltekit-superforms/client';

  export let data: PageData;

  const { form, errors, constraints, enhance, delayed, message } = superForm(
    data.form
  );
</script>

{#if $message}
  <h3 class:invalid={$page.status >= 400}>{$message}</h3>
{/if}

<h2>{!$form.id ? 'Create' : 'Update'} user</h2>
```

There are plenty of variables extracted from `superForm`; refer to the [API reference](/api#superform-return-type) for a complete list.

Apart from getting the data ready to be displayed, we've prepared a status message, using `$page.status` to test for success or failure, and we're using `$form.id` to display a "Create user" or "Update user" title. Now let's add the form itself:

**src/routes/users/[[id]]/+page.svelte**

```svelte
<form method="POST" use:enhance>
  <input type="hidden" name="id" bind:value={$form.id} />

  <label>
    Name<br />
    <input
      name="name"
      aria-invalid={$errors.name ? 'true' : undefined}
      bind:value={$form.name}
      {...$constraints.name} />
    {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}
  </label>

  <label>
    E-mail<br />
    <input
      name="email"
      type="email"
      aria-invalid={$errors.email ? 'true' : undefined}
      bind:value={$form.email}
      {...$constraints.email} />
    {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}
  </label>

  <button>Submit</button>
  {#if $delayed}Working...{/if}
</form>

<style>
  .invalid {
    color: red;
  }
</style>
```

## Creating and Updating a user

With this, the form should be ready for creating a user. Let's add the form action for that:

**src/routes/+page.server.ts**

```ts
export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);
    if (!form.valid) return fail(400, { form });

    if (!form.data.id) {
      // CREATE user
      const user = { ...form.data, id: userId() };
      users.push(user);

      return message(form, 'User created!');
    } else {
      // UPDATE user
      const index = users.findIndex((u) => u.id == form.data.id);
      if (index == -1) throw error(404, 'User not found.');

      users[index] = { ...form.data, id: form.data.id };
      return message(form, 'User updated!');
    }

    return { form };
  }
};
```

This is where you should access your database API. In our case, we're only doing some array manipulations.

With this, we have 3 out of 4 letters of CRUD in about 150 lines of code, half of it HTML!

## Deleting a user

To delete a user, we can make use of the HTML `button` element, which can have a name and a value that will be passed only if that specific button was used to post the form. Add this at the end of the form:

**src/routes/users/[[id]]/+page.svelte**

```svelte
{#if $form.id}
  <button
    name="delete"
    on:click={(e) => !confirm('Are you sure?') && e.preventDefault()}
    class="danger">Delete user</button>
{/if}
```

In the form action, we now use the `FormData` from the request to check if the delete button was pressed. We shouldn't use the schema since `delete` is not a part of the user, but it's not a big change:

**src/routes/+page.server.ts**

```ts
export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, crudSchema);

    if (formData.has('delay')) {
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!form.valid) return fail(400, { form });

    if (!form.data.id) {
      // CREATE user
      const user = { ...form.data, id: userId() };
      users.push(user);

      return message(form, 'User created!');
    } else {
      const index = users.findIndex((u) => u.id == form.data.id);
      if (index == -1) throw error(404, 'User not found.');

      if (formData.has('delete')) {
        // DELETE user
        users.splice(index, 1);
        throw redirect(303, '/users');
      } else {
        // UPDATE user
        users[index] = { ...form.data, id: form.data.id };
        return message(form, 'User updated!');
      }
    }
  }
};
```

Now all four CRUD operations are complete! An issue, however, is that we have to redirect after deleting to avoid a 404, so we cannot use `form.message` to show "User deleted", since the validation data won't exist after redirecting.

Redirecting with a message is a general problem; for example, maybe we'd like to redirect to the newly created user after it's been created. Fortunately, there is a solution; the sister library to Superforms handles this. [Read more about it here](/flash-messages).

## Listing the users

The last loose thread is to display a list of the users. It'll be quite trivial; add this to the top of `+page.svelte`:

**src/routes/+page.svelte**

```svelte
<h3>Users</h3>
<div class="users">
  {#each data.users as user}
    <a href="/users/{user.id}">{user.name}</a>
  {/each}
</div>
```

And some styling for everything at the end:

```svelte
<style>
  .invalid {
    color: red;
  }

  .danger {
    background-color: brown;
  }

  .users {
    columns: 3 150px;
  }

  .users > * {
    display: block;
    white-space: nowrap;
    overflow-x: hidden;
  }
</style>
```

That's it! Thank you for following along. The code is [available here](https://stackblitz.com/edit/sveltekit-superforms-1-crud?file=src%2Froutes%2Fusers%2F[[id]]%2F%2Bpage.server.ts,src%2Froutes%2Fusers%2F[[id]]%2F%2Bpage.svelte).

If you have any questions, post them in the [discussion forum](https://github.com/ciscoheat/sveltekit-superforms/discussions) or ask them on [the Discord server](https://discord.gg/AptebvVuhB).
