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

## optional vs. nullable

`null` will take precedence over `undefined`, so a field both `nullable` and `optional` will have `null` as its default value. Otherwise it's `undefined`.

## Changing a default value

If you're not satisfied with the default values, you can set your own in the schema. You can even abuse the typing system a bit to handle the classic "agree to terms" checkbox:

```ts
const schema = z.object({
  age: z
    .number()
    .positive()
    .default('' as number),
  agree: z.literal(true).default(false as true)
});
```

This looks a bit strange, but will ensure that an age isn't set to 0 as default (which will hide placeholder text in the input field), but also that the agree checkbox is unchecked as default, and will only accept true (checked) as a value.

Just note that you will bypass the type system with this, so the default value will not correspond to the type, but this will usually not be a problem since `form.valid` will be `false` if these values are posted, and that should be the main determinant whether the data is trustworthy.

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
