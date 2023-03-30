# Designing a CRUD interface

An excellent use case for sveltekit-superforms is a backend interface, commonly used as in the acronym **CRUD** (Create, Read, Update, Delete):

1. Display an empty form
1. POST the form, validate the data
1. Create a new entity with the data **(Create)**
1. Fetch the entity **(Read)**
1. Display it in a form
1. POST the form, validate the data
1. Update the entity with the data **(Update)**
1. Delete the entity **(Delete)**
1. ???
1. `GOTO 1`

Because you can send the data model directly to the `superValidate` function and thereby use it in a form, it becomes quite easy to implement the above steps.

## Getting started

To follow along, there are two ways:

### 1. The easy way

Open the [Stackblitz repo](https://stackblitz.com/edit/sveltekit-superforms-crud?file=src%2Froutes%2F%2Bpage.svelte,src%2Froutes%2F%2Bpage.server.ts) and you're up and running in the browser in 15 seconds!

### 2. The slightly harder way

Start from scratch in a new SvelteKit project, by following the simple instructions at https://kit.svelte.dev/ to create a TypeScript skeleton project. Then add this to `<head>` for a much nicer visual experience:

**src/app.html**

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/normalize.css@8.0.1/normalize.css"
/>
<link rel="stylesheet" href="https://unpkg.com/sakura.css/css/sakura.css" />
```

## Creating a test database

When you have the code up and running, we need a data storage for testing. Refer to the [Zod schema reference](https://zod.dev/?id=primitives) for help with building a schema.

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

// Set a global variable to preserve DB when Vite reloads.
const g = globalThis as unknown as { users: UserDB };

// Let's worry about id collisions later
export const userId = () => String(Math.random()).slice(2);

// A simple user "database"
export const users: UserDB = (g.users = g.users || [
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
]);
```

This user database in the shape of an array will be helpful for testing our CRUD operations.

When starting on the server page, we'll encounter a thing about validation schemas. The `userSchema` is for the database integrity, so an `id` must exist there. But we want to create an entity, and must therefore allow `id` not to exist when creating users.

This is done by extending the `userSchema`:

**src/routes/+page.server.ts**

```ts
import { superValidate, message } from 'sveltekit-superforms/server';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { users, userId, userSchema } from '$lib/users';

const schema = userSchema.extend({
  id: userSchema.shape.id.optional()
});
```

The advantage is that **Create** and **Update** can now use the same schema, which means that they can share the same user interface. This is a fundamental idea in sveltekit-superforms, so you can pass either `null/undefined` or an entity to `superValidate`, and it will generate default values if the value passed to it if empty.

Let's add a load function to the page:

**src/routes/+page.server.ts**

```ts
export const load = (async ({ url }) => {
  // READ user
  // For simplicity, use the id query parameter instead of a route.
  const id = url.searchParams.get('id');
  const user = id ? users.find((u) => u.id == id) : null;

  if (id && !user) throw error(404, 'User not found.');

  const form = await superValidate(user, schema);
  return { form, users };
}) satisfies PageServerLoad;
```

Some simple logic is used to find the user, and detect if a 404 should be displayed. Then we're returning both `form`, as usual, and `users`, so they can be displayed as a list. (Sometimes, CRUDL is used as an acronym, since listing is also quite fundamental to data management.)

Now when we've loaded the data, let's display it, starting with the script part of the page component:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { superForm } from 'sveltekit-superforms/client';

  export let data: PageData;

  const { form, errors, constraints, enhance, delayed, message, empty } =
    superForm(data.form);
</script>

{#if $message}
  <h3 class:invalid={$page.status >= 400}>{$message}</h3>
{/if}

<h2>{$empty ? 'Create' : 'Update'} user</h2>
```

There are plenty of variables extracted from `superForm`, refer to the [API reference](https://github.com/ciscoheat/sveltekit-superforms/wiki/API-reference#superformform-options) to know more about them.

Apart from getting the data ready to be displayed, we've prepared a status message, using `$page.status` to test for success or failure, and we're using the `$empty` store to display a "Create user" or "Update user" title. Now lets add the form itself:

```svelte
<form method="POST" use:enhance>
  <input type="hidden" name="id" bind:value={$form.id} />

  <label>
    Name<br />
    <input
      name="name"
      data-invalid={$errors.name}
      bind:value={$form.name}
      {...$constraints.name}
    />
    {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}
  </label>

  <label>
    E-mail<br />
    <input
      name="email"
      data-invalid={$errors.email}
      bind:value={$form.email}
      {...$constraints.email}
    />
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

With this, the form should be ready for creating a user. Let's add the form action for that:

```ts
export const actions = {
  default: async (event) => {
    const form = await superValidate(event, crudSchema);
    if (!form.valid) return fail(400, { form });

    if (!form.data.id) {
      // CREATE user
    } else {
      // UPDATE user
    }

    return { form };
  }
} satisfies Actions;
```

This is where you should access your database API. Since we're using an array, the create and update logic is simple:

```ts
if (!form.data.id) {
  // CREATE user
  const user = { ...form.data, id: userId() };
  users.push(user);

  return message(form, 'User created!');
} else {
  // UPDATE user
  const user = users.find((u) => u.id == form.data.id);
  if (!user) throw error(404, 'User not found.');

  users[users.indexOf(user)] = { ...form.data, id: user.id };
  return message(form, 'User updated!');
}
```

With this, we have 3 out of 4 letters of CRUD in about 150 lines of code, half of it html!

To delete a user, we can make use of the html `button` element, which can have a name and a value that will be passed only if that specific button was used to post the form. Add this at the end of the form:

**src/routes/+page.svelte**

```svelte
{#if !$empty}
  <button
    name="delete"
    value="delete"
    on:click={(e) => !confirm('Are you sure?') && e.preventDefault()}
    class="danger">Delete user</button
  >
{/if}
```

In the form action, we now use the `FormData` from the request to check if the delete button was pressed. We can't use the schema since `delete` is not a part of it, but it's not a big change:

**src/routes/+page.server.ts**

```ts
export const actions = {
  default: async (event) => {
    // Use the request instead of the event directly
    const data = await event.request.formData();
    const form = await superValidate(data, schema);

    if (!form.valid) return fail(400, { form });

    if (!form.data.id) {
      // No change in here
    } else {
      const user = users.find((u) => u.id == form.data.id);
      if (!user) throw error(404, 'User not found.');

      const index = users.indexOf(user);

      // Check if deleting
      if (data.has('delete')) {
        // DELETE user
        users.splice(index, 1);
        throw redirect(303, '?');
      } else {
        // UPDATE user
        users[index] = { ...form.data, id: user.id };
        return message(form, 'User updated!');
      }
    }
  }
};
```

Now we have all four CRUD operations! An issue however is that we have to redirect after deleting to avoid a 404, which prevents `form.message` to be used, since the validation data won't exist after redirecting. Redirecting with a message is a general problem, for example maybe we'd like to redirect to the newly created user after it's been created.

Things _could_ be solved client-side, but it takes some extra logic and won't work with SSR. Fortunately there is a solution, the sister library to `sveltekit-superforms` is called [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message) and makes this quite easy. Check it out!

The last loose thread is to display a list of the users. It'll be quite trivial, add this to the top of `+page.svelte`:

**src/routes/+page.svelte**

```svelte
<h3>User list</h3>
<div class="users">
  {#each data.users as user}
    <a href="?id={user.id}">{user.name}</a>
  {/each}
</div>
```

And some styling for it at the end:

```css
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

That's it! Thank you for following along, if you have any questions, post in the [discussion forum](https://github.com/ciscoheat/sveltekit-superforms/discussions) or ask on [the Discord server](https://discord.gg/AptebvVuhB).
