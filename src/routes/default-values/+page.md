<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# Default values

<Head title="Default values" />

When `superValidate` encounters a schema field that isn't optional, and when its supplied data is empty, a default value is returned to the form, to ensure that the type is correct:

| type    | value       |
| ------- | ----------- |
| string  | `""`        |
| number  | `0`         |
| boolean | `false`     |
| Array   | `[]`        |
| object  | `{}`        |
| bigint  | `BigInt(0)` |
| symbol  | `Symbol()`  |

## Changing a default value

You can, of course, set your own default values in the schema, using the `default` method in Zod, for example. You can even abuse the typing system a bit to handle the classic "agree to terms" checkbox:

```ts
const schema = z.object({
  age: z.number().positive().default('' as unknown as number),
  agree: z.literal(true).default(false as true)
});
```

This looks a bit strange, but will ensure that the age isn't set to 0 as default (which will hide placeholder text in the input field), and also ensure that the agree checkbox is unchecked as default while also only accepting `true` (checked) as a value.

> Since the default value will not correspond to the type, this will not work when using Zod's [refine](https://zod.dev/?id=refine) on the whole schema. Validation itself is no problem though, `form.valid` will be `false` if these values are posted, which should be the main determinant of whether the data is trustworthy.

## optional vs. nullable

Fields set to `null` will take precedence over `undefined`, so a field that is both `nullable` and `optional` will have `null` as its default value. Otherwise, it's `undefined`.

## Explicit defaults

Enums and unions must have an explicit default value:

```ts
const schema = z.object({
  fish: z.enum(['Salmon', 'Tuna', 'Trout']).default('Salmon'),
  either: z.union([z.number(), z.string()]).default(123)
});
```

If the field is nullable or optional, there's no need for a default value (but it can still be set).

```ts
const schema2 = z.object({
  fish: z.enum(['Salmon', 'Tuna', 'Trout']).nullable()
});
```
