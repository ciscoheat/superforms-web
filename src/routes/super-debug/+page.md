<script lang="ts">
  import Head from '$lib/Head.svelte'
  import CssVars from './CssVars.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { writable } from 'svelte/store'  
  import Input from './Input.svelte'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { dev } from '$app/environment'

  const form = writable({
    name: 'Gaspar Soiaga',
    email: 'wendat@example.com',
    birth: new Date('1649-01-01')
  });

  const errors = writable({
    email: ['Cannot use example.com as email.'],
  });

  let product = undefined;
  let rejected = undefined;

  onMount(() => {
    product = new Promise(resolve => {
      fetch('https://dummyjson.com/products/1').then(async response => {
        await new Promise(res => setTimeout(res, 2000))
        resolve(response.json()
      )})
    })

    rejected = new Promise(async (_, reject) => {
      setTimeout(() => reject(new Error('Broken promise')), 2000)
    })
  })

</script>

<Head title="SuperDebug - the Super debugging component" />

# SuperDebug

`SuperDebug` is a debugging component that gives you colorized and nicely formatted output for any data structure, usually `$form` returned from `superForm`. It also shows the current page status in the top right corner.

It's not limited to the Superforms data, other use cases includes debugging plain objects, promises, stores and more.

## Usage

```ts
import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
```

```svelte
<SuperDebug data={$form} />
```

## Props reference

```svelte
<SuperDebug
  data={any}
  display?={true}
  label?=''
  promise?={false}
  status?={true}
  stringTruncate?={120}
  raw?={false}
  functions?={false}
  theme?='default'
  ref?={HTMLPreElement} 
/>
```

| Prop               | Type           | Default value | Description |
| ------------------ | -------------- | ------------- | ----------- |
| **data**           | any            |               | Data to be displayed by SuperDebug. |
| **display**        | boolean        | `true`        | Whether to show or hide SuperDebug. |
| **status**         | boolean        | `true`        | Whether to show or hide the HTTP status code of the current page. |
| **label**          | string         | `""`          | Add a label to SuperDebug, useful when using multiple instances on a page. |
| **collapsible**    | boolean        | `false`       | Makes the component collapsible on a per-route basis. |
| **stringTruncate** | number         | `120`         | Truncate long string field valuns of the data prop. Set to `0` to disable truncating. |
| **raw**            | boolean        | `false`       | Skip promise and store detection when `true`. |
| **functions**      | boolean        | `false`       | Enables the display of fields of the data prop that are functions. |
| **theme**          | "default", "vscode" | `"default"` | Display theme, which can also be customized with CSS variables. |
| **ref**            | HTMLPreElement |               | Reference to the pre element that contains the data. |

## Examples

<Input {form} />

### Default output

```svelte
<SuperDebug data={$form} />
```

<SuperDebug data={$form} />

### With a label

A label is useful when using multiple instance of SuperDebug.

```svelte
<SuperDebug label="Useful label" data={$form} />
```

<SuperDebug label="Useful label" data={$form} />

### With label, without status

```svelte
<SuperDebug label="Sample User" status={false} data={$form} />
```

<SuperDebug label="Sample User" status={false} data={$form} />

### Without label and status

```svelte
<SuperDebug data={$form} status={false} />
```

<SuperDebug data={$form} status={false} />

### Display only in dev mode

```svelte
<script lang="ts">
  import { dev } from '$app/environment';
</script>

<SuperDebug data={$form} display={dev} />
```

<SuperDebug data={$form} display={dev} />

### Promise support

To see this in action, scroll to the product data below and hit refresh.

```ts
// +page.ts
export const load = (async ({ fetch }) => {
  const promiseProduct = fetch('https://dummyjson.com/products/1')
    .then(response => response.json())

  return { promiseProduct }
})
```

```svelte
<SuperDebug label="Dummyjson product" data={data.promiseProduct} />
```

<SuperDebug label="Dummyjson product" data={product} />

### Rejected promise

```ts
// +page.ts
export const load = (async ({ fetch }) => {
  const rejected = Promise.reject(throw new Error('Broken promise'))
  return { rejected }
})
```

```svelte
<SuperDebug data={rejected} />
```

<SuperDebug data={rejected} />

### Composing debug data

If you want to debug multiple stores/objects in the same instance.

```svelte
<SuperDebug data={{$form, $errors}} />
```

<SuperDebug data={{$form, $errors}} />

### SuperDebug loves stores

You can pass a store directly to SuperDebug:

```svelte
<SuperDebug data={form} />
```

<SuperDebug data={form} />

### Custom styling

```svelte
<SuperDebug 
  data={$form} 
  theme="vscode" 
  --sd-code-date="lightgreen" 
/>
```

<SuperDebug 
  data={$form} 
  theme="vscode" 
  --sd-code-date="lightgreen"
/>

#### CSS variables available for customization

<CssVars />

Note that styling the component produces the side-effect described in the [Svelte docs](https://svelte.dev/docs/component-directives#style-props).

### Page data

Debugging Svelte's `$page` data, when the going gets tough. Since it can contain a lot of data, using the `collapsible` prop is convenient.

```svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<SuperDebug label="$page data" data={$page} collapsible />
```

<SuperDebug label="$page data" data={$page} collapsible />
