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
    <Control>
      {#snippet children({ props })}
        <Label>Name</Label>
	<input type="text" {...props} bind:value={$formData.name} />
      {/snippet}
    </Control>
    <Description>Be sure to use your real name.</Description>
    <FieldErrors />
  </Field>
  <Field {form} name="email">
    <Control>
      {#snippet children({ props })}
        <Label>Email</Label>
        <input type="email" {...props} bind:value={$formData.email} />
      {/snippet}
    </Control>
    <Description>It's preferred that you use your company email.</Description>
    <FieldErrors />
  </Field>
  <Field {form} name="password">
    <Control>
        {#snippet children({ props })}
        <Label>Password</Label>
        <input type="password" {...props} bind:value={$formData.password} />
      {/snippet}      
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
