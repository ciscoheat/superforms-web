# Default values

<svelte:head><title>Default values</title></svelte:head>

When `superValidate` encounters a schema field that isn't optional, or when a `FormData` field is empty, a default value is returned to the form, to ensure that the type is correct:

| type    | value       |
| ------- | ----------- |
| string  | `""`        |
| number  | `0`         |
| boolean | `false`     |
| Array   | `[]`        |
| object  | `{}`        |
| bigint  | `BigInt(0)` |
| symbol  | `Symbol()`  |

This behavior of returning empty values can be turned off if you pass `options.implicitDefaults = false` to `superValidate`, which means that you must add `default` to all required fields of your schema.

## Changing a default value

If you're not satisfied with the default values, you can set a default value in the schema. You can even abuse the typing system a bit to handle the classic "agree to terms" checkbox:

```ts
const schema = z.object({
  age: z.number().positive().default(NaN),
  agree: z.literal(true).default(false as true)
});
```

This looks strange, but will ensure that an age must be selected and the agree checkbox is unchecked as default, and will only accept true as a value.

Just note that you will bypass the type system with this, so the default value will not correspond to the data type, but this will usually not be a problem since `form.valid` will be `false` if the default values are posted as-is, and that should be the main determinant whether the data is trustworthy.

## Non-supported defaults

Some Zod types like `ZodEnum` and `ZodUnion` can't use the above default values, in that case you have to set a default value for them yourself:

```ts
const schema = z.object({
  fish: z.enum(['Salmon', 'Tuna', 'Trout']).default('Salmon')
});

// If it's nullable/optional/nullish, no need for a default (but can still be set).
const schema = z.object({
  fish: z.enum(['Salmon', 'Tuna', 'Trout']).nullable()
});
```
