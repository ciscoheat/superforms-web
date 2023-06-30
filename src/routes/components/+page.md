<svelte:head><title>Forms and fields in components</title></svelte:head>

# Forms and fields in components

Just by looking at the rather simple [get started tutorial](/get-started), it's obvious that quite a bit of boilerplate code adds up when building a Superform:

```svelte
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
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client'

  export let data: PageData;

  const { form, errors, enhance, ... } = superForm(data.form);

  const { 
    form: loginForm, 
    errors: loginErrors, 
    enhance: loginEnhance, 
    ... 
  } = superForm(data.loginForm);

  const { 
    form: registerForm, 
    errors: registerErrors, 
    enhance: registerEnhance, 
    ... 
  } = superForm(data.registerForm);
</script>
```

This leads to the question if a form and its fields can be factored out into components?

## Factoring out a form

To do this, you need the type of the schema, which can be defined as such:

**src/lib/schemas.ts**

```ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: ...
});

export type LoginSchema = typeof loginSchema;
```

Now you can import and use this type in a separate component by using:

**src/routes/LoginForm.svelte**

```svelte
<script lang="ts">
  import type { SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms/client'
  import type { LoginSchema } from '$lib/schemas';

  export let data: SuperValidated<LoginSchema>;

  const { form, errors, enhance, ... } = superForm(data);
</script>

<form method="POST" use:enhance>
  <!-- Business as usual -->
</form>
```

Use it by passing the data from `+page.svelte` to the component, making it much less cluttered:

**+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
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

<style lang="scss">
  .invalid {
    color: indianred;
  }
</style>
```

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

It's a little bit better, and will certainly help when the components requires some styling, but there are still plenty of attributes. Can we do even better?

### Using a fieldProxy

You may have used [proxy objects](/concepts/proxy-objects) for converting an input field string like `"2023-04-12"` into a `Date`, but this is just a special usage of proxies. They can actually be used for any part of the form data, to have a store that can modify a part of the `$form` store. If you want to update just `$form.name`, for example:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { superForm, fieldProxy } from 'sveltekit-superforms/client'

  export let data: PageData;

  const { form } = superForm(data.form);

  const name = fieldProxy(form, 'name');
</script>

<div>Name: {$name}</div>
<button on:click={() => $name = ''}>Clear name</button>
```

Any updates to `$name` will reflect in `$form.name`. Note that this will also [taint](/concepts/tainted) that field, so if this not intended, you may want to use the `$tainted` store and undefine its `name` field.

A `fieldProxy` isn't enough here however. We'd still have to make three proxies for `form`, `errors` and `constraints`, and then we're back to the same problem again.

### Using a formFieldProxy

The solution is to use a `formFieldProxy`, which is a helper function for producing the above three proxies from a form. To do this, we cannot immediately deconstruct what we need from `superForm`, since `formFieldProxy` takes the form itself as an argument:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { superForm, formFieldProxy } from 'sveltekit-superforms/client'

  export let data: PageData;

  const form = superForm(data.form);

  const { path, value, errors, constraints } = formFieldProxy(form, 'name');
</script>
```

But we didn't want to pass all those proxies, so let's imagine a component that will handle even the above proxy creation for us.

```svelte
<TextField {form} field="name" />
```

How nice would this be? This can actually be pulled of in a typesafe way with a bit of Svelte magic:

**TextField.svelte**

```svelte
<script lang="ts">
  import type { z, AnyZodObject } from 'zod';
  import type { ZodValidation, FormPathLeaves } from 'sveltekit-superforms';
  import { formFieldProxy, type SuperForm } from 'sveltekit-superforms/client';

  type T = $$Generic<AnyZodObject>;

  export let form: SuperForm<ZodValidation<T>, unknown>;
  export let field: FormPathLeaves<z.infer<T>>;

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
    {...$$restProps}
  />
</label>
{#if $errors}<span class="invalid">{$errors}</span>{/if}

<style lang="scss">
  .invalid {
    color: orangered;
  }
</style>
```

Some explanations are definitiely at hand! First, `type T = $$Generic<AnyZodObject>` is a way of defining generic arguments in components. Having defined `T` as `AnyZodObject` (a schema type), we can use it in the `form` prop to ensure that only a `SuperForm` matching the `field` prop are used. Unfortunately this takes a bit of knowledge of the types, but that's what examples are for, right?

What may look strange is `ZodValidation<T>`, this is required because we can use refine/superRefine/transform on the schema object, which will wrap it in a `ZodEffects` type, so it's not a `AnyZodObject` anymore. The `ZodValidation` type will extract the actual object, which may be several levels deep.

We also need the fields for the actual data object, not the schema itself. `z.infer<T>` is used for that. And it's wrapped in `FormPathLeaves`, the type for a nested path, so we can use [nested data](/concepts/nested-data).

> The `FormPathLeaves` type prevents using a field that isn't at the end of the schema (the "leaves" of the schema tree). This means that arrays and objects cannot be used in `formFieldProxy`.

## A minor issue: Checkboxes

One thing that needs a workaround are checkboxes, since they don't bind with `bind:value` but with `bind:checked`, which requires a `boolean`.

Because our component is generic, `value` returned from `formFieldProxy` can't be `boolean` specifically, so we need to make a specific checkbox component to use it, or cast it with a dynamic declaration.

```svelte
<script lang="ts">
  import type { Writable } from 'svelte/store';
  // ... other imports and props

  const { value, errors, constraints } = formFieldProxy(form, field);

  $: boolValue = value as Writable<boolean>;
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

## Using the componentized field in awesome ways

As mentioned, using this field component is now as simple as:

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

We can now produce a text field for any object inside our data, which will update the `$form` store. 

In general, nested data requires the `dataType` option to be set to `'json'`, but this example works without it, even without `use:enhance`, since arrays of primitive values are [coerced automatically](/concepts/nested-data#an-exception-arrays-with-primitive-values).

I hope you now feel under your fingers the superpowers that Superforms bring! 💥