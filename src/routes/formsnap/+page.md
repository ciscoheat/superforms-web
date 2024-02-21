<script lang="ts">
  import Head from '$lib/Head.svelte'
  import formsnap from './formsnap.svg?raw'
</script>

<h1 class="logo">
{@html formsnap}
</h1>

<Head title="Integrate Superforms with Formsnap" />

As you may have seen on the [componentization](/components) page, quite a bit of boilerplate can add up for a form, and then we haven't even touched on the subject of accessibility.

Fortunately, the UI-component guru Hunter Johnston, aka [@huntabyte](https://twitter.com/huntabyte), has done the community a great service with his library [Formsnap](https://www.formsnap.dev/)! It not only simplifies how to put your forms into components, but also adds top-class accessibility with no effort.

This is the style you can expect when using Formsnap, compared to manually putting attributes on individual form fields:

```svelte
<form method="POST" use:enhance>
  <Field {form} name="name">
    <Control let:attrs>
      <Label>Name</Label>
      <input {...attrs} bind:value={$formData.name} />
    </Control>
    <Description>Be sure to use your real name.</Description>
    <FieldErrors />
  </Field>
  <Field {form} name="email">
    <Control let:attrs>
      <Label>Email</Label>
      <input {...attrs} type="email" bind:value={$formData.email} />
    </Control>
    <Description>It's preferred that you use your company email.</Description>
    <FieldErrors />
  </Field>
  <Field {form} name="password">
    <Control let:attrs>
      <Label>Password</Label>
      <input {...attrs} type="password" bind:value={$formData.password} />
    </Control>
    <Description>Ensure the password is at least 10 characters.</Description>
    <FieldErrors />
  </Field>
</form>
```

If it suits you, please check out the [Formsnap](https://www.formsnap.dev/) library, it is really nice! 💥

<style>
  .logo {
    width: 240px;
  }
</style>