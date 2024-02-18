<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

<Head title="Forms and fields in components" />

# Forms and fields in components

By looking at the rather simple [get started tutorial](/get-started), it's obvious that quite a bit of boilerplate code adds up for a Superform:

```svelte
<!-- For each form field -->
<label for="name">Name</label>
<input
  type="text"
  name="name"
  aria-invalid={$errors.name ? 'true' : undefined}
  bind:value={$form.name}
  {...$constraints.name} 
/>
{#if $errors.name}
  <span class="invalid">{$errors.name}</span>
{/if}
```

And it also gets bad in the script part when you have more than a couple of forms on the page:

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'

  export let data;

  const {
    form: loginForm,
    errors: loginErrors,
    enhance: loginEnhance,
    //...
  } = superForm(data.loginForm);

  const {
    form: registerForm,
    errors: registerErrors,
    enhance: registerEnhance,
    // ...
  } = superForm(data.registerForm);
</script>
```

This leads to the question of whether a form and its fields can be factored out into components?

## Factoring out a form

To do this, you need the type of the schema, which can be defined as follows:

**src/lib/schemas.ts**

```ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: // ...
});

export type LoginSchema = typeof loginSchema;
```

Now you can import and use this type in a separate component:

**src/routes/LoginForm.svelte**

```svelte
<script lang="ts">
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms'
  import type { LoginSchema } from '$lib/schemas';

  export let data: SuperValidated<Infer<LoginSchema>>;

  const { form, errors, enhance } = superForm(data);
</script>

<form method="POST" use:enhance>
  <!-- Business as usual -->
</form>
```

Use it by passing the form data from `+page.svelte` to the component, making it much less cluttered:

**+page.svelte**

```svelte
<script lang="ts">
  export let data;
</script>

<LoginForm data={data.loginForm} />
<RegisterForm data={data.registerForm} />
```

## Factoring out form fields

Since `bind` is available on Svelte components, we can make a `TextInput` component quite easily:

**TextInput.svelte**

```svelte
<script lang="ts">
  import type { InputConstraint } from 'sveltekit-superforms';

  export let value: string;
  export let label: string | undefined = undefined;
  export let errors: string[] | undefined = undefined;
  export let constraints: InputConstraint | undefined = undefined;
</script>

<label>
  {#if label}<span>{label}</span><br />{/if}
  <input
    type="text"
    bind:value
    aria-invalid={errors ? 'true' : undefined}
    {...constraints}
    {...$$restProps} 
  />
</label>
{#if errors}<span class="invalid">{errors}</span>{/if}
```

> The `type` attribute on input elements must be hard-coded in Svelte, [explained here](https://stackoverflow.com/a/66191989/70894). Especially important for `type="number"`.

**+page.svelte**

```svelte
<form method="POST" use:enhance>
  <TextInput
    name="name"
    label="name"
    bind:value={$form.name}
    errors={$errors.name}
    constraints={$constraints.name} 
  />

  <h4>Tags</h4>

  {#each $form.tags as _, i}
    <TextInput
      name="tags"
      label="Name"
      bind:value={$form.tags[i].name}
      errors={$errors.tags?.[i]?.name}
      constraints={$constraints.tags?.name} 
    />
  {/each}
</form>
```

(Note that you must bind directly to `$form.tags` with the index, you cannot use the each loop variable, hence the underscore.)

This is a bit better and will certainly help when the components require some styling, but there are still plenty of attributes. Can we do even better?

### Using a fieldProxy

You may have used [proxy objects](/concepts/proxy-objects) for converting an input field string like `"2023-04-12"` into a `Date`, but that's a special usage of proxies. They can actually be used for any part of the form data, to have a store that can modify a part of the `$form` store. If you want to update just `$form.name`, for example:

```svelte
<script lang="ts">
  import { superForm, fieldProxy } from 'sveltekit-superforms/client';

  export let data;

  const { form } = superForm(data.form);

  const name = fieldProxy(form, 'name');
</script>

<div>Name: {$name}</div>
<button on:click={() => ($name = '')}>Clear name</button>
```

Any updates to `$name` will reflect in `$form.name`. Note that this will also [taint](/concepts/tainted) that field, so if this is not intended, you can use the whole superForm object and add an option:

```ts
const theForm = superForm(data.form);
const { form } = theForm;

const name = fieldProxy(theForm, 'name', { taint: false });
```

A `fieldProxy` isn't enough here, however. We'd still have to make proxies for `form`, `errors`, and `constraints`, and then we're back to the same problem again.

### Using a formFieldProxy

The solution is to use a `formFieldProxy`, which is a helper function for producing the above proxies from a form. To do this, we cannot immediately deconstruct what we need from `superForm` since `formFieldProxy` takes the form itself as an argument:

```svelte
<script lang="ts">
  import type { PageData } from './$types.js';
  import { superForm, formFieldProxy } from 'sveltekit-superforms/client';

  export let data: PageData;

  const form = superForm(data.form);

  const { path, value, errors, constraints } = formFieldProxy(form, 'name');
</script>
```

But we didn't want to pass all those proxies, so let's imagine a component that will handle even the above proxy creation for us.

```svelte
<TextField {form} field="name" />
```

How nice would this be? This can actually be pulled off in a typesafe way with a bit of Svelte magic:

```svelte
<script lang="ts" context="module">
  type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { 
    formFieldProxy, 
    type SuperForm, 
    type FormPathLeaves 
  } from 'sveltekit-superforms';

  export let form: SuperForm<T>;
  export let field: FormPathLeaves<T>;

  const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<label>
  {field}<br />
  <input
    name={field}
    type="text"
    aria-invalid={$errors ? 'true' : undefined}
    bind:value={$value}
    {...$constraints}
    {...$$restProps} />
</label>
{#if $errors}<span class="invalid">{$errors}</span>{/if}
```

The Svelte syntax requires `Record<string, unknown>` to be defined before its used in the `generics` attribute, so we have to import it in a module context. Now when `T` is defined (the schema object type), we can use it in the `form` prop to ensure that only a `SuperForm` matching the `field` prop is used.

> The `FormPathLeaves` type prevents using a field that isn't at the end of the schema (the "leaves" of the schema tree). This means that arrays and objects cannot be used in `formFieldProxy`. Array-level errors are handled [like this](/concepts/error-handling#form-level-and-array-errors).

## A minor issue: Checkboxes

A workaround is required for checkboxes, since they don't bind with `bind:value`, rather with `bind:checked`, which requires a `boolean`.

Because our component is generic, `value` returned from `formFieldProxy` can't be `boolean` specifically, so we need to make a specific checkbox component to use it, or cast it with a dynamic declaration:

```svelte
<script lang="ts">
  import type { Writable } from 'svelte/store';
  // ... other imports and props

  const { value, errors, constraints } = formFieldProxy(form, field);
  const boolValue = value as Writable<boolean>;
</script>

<input
  name={field}
  type="checkbox"
  class="checkbox"
  bind:checked={$boolValue}
  {...$constraints}
  {...$$restProps} 
/>
```

Checkboxes, especially grouped ones, can be tricky to handle. Read the Svelte tutorial about [bind:group](https://svelte.dev/tutorial/group-inputs), and see the [Ice cream example](https://stackblitz.com/edit/sveltekit-superforms-group-inputs?file=src%2Froutes%2F%2Bpage.server.ts,src%2Froutes%2F%2Bpage.svelte) on Stackblitz if you're having trouble with it.

## Using the componentized field in awesome ways

Using this component is now as simple as:

```svelte
<TextField {form} field="name" />
```

But to show off some super proxy power, let's recreate the tags example above with the `TextField` component:

```svelte
<form method="POST" use:enhance>
  <TextField name="name" {form} field="name" />

  <h4>Tags</h4>

  {#each $form.tags as _, i}
    <TextField name="tags" {form} field="tags[{i}].name" />
  {/each}
</form>
```

We can now produce a type-safe text field for any object inside our data, which will update the `$form` store.

In general, nested data requires the `dataType` option to be set to `'json'`, but this example works without it, even without `use:enhance`, since arrays of primitive values are [coerced automatically](/concepts/nested-data#an-exception-arrays-with-primitive-values).

I hope you now feel under your fingers the superpowers that Superforms bring! 💥
