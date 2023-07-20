<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# API reference

<Head title="API reference" />

Throughout the reference, the following types are represented:

```ts
/**
 * T represents a validation schema.
 *
 * z.object({
 *   name: z.string().min(2)
 * })
 */
T extends AnyZodObject

/**
 * S refers to the underlying type of the schema,
 * the actual data structure.
 *
 * { name: string }
 */
S = z.infer<T>

/**
 * Nested represents a structure where the values in S
 * are replaced with the second parameter.
 *
 * { name: string[] | undefined }
 */
Nested<S, string[] | undefined> // Errors for each field in S

/**
 * FormPath and FormPathLeaves are string paths that points to a
 * field in the schema. FormPathLeaves can only be used at the
 * end nodes of the schema.
 *
 * z.object({
 *   tags: z.object({
 *     name: z.string().min(1)
 *   }).array()
 * })
 */
FormPath<S> = "tags[3]"
FormPathLeaves<S> = "tags[3].name"
```

## Server API

```ts
import {
  superValidate,
  superValidateSync,
  actionResult,
  defaultValues,
  message,
  setError
} from 'sveltekit-superforms/server';
```

### superValidate(schema | data, schema? | options?, options?)

If you want the form to be initially empty, you can pass the schema as the first parameter:

```ts
superValidate<T, M = any>(
  schema: T,
  options?: SuperValidateOptions
): Promise<SuperValidated<T, M>>
```

If you want to populate the form, for example, from a database, `URL` parameters in the load function, or `FormData` in the form actions, send the data as the first parameter and the schema second:

```ts
superValidate<T, M = any>(
  data:
    | RequestEvent
    | Request
    | FormData
    | URL
    | URLSearchParams
    | Partial<S>
    | null
    | undefined,
  schema: T,
  options?: SuperValidateOptions
): Promise<SuperValidated<T, M>>
```

The `superValidateSync` function can be useful on the client in Svelte components, since they cannot have top-level `await`.

```ts
superValidateSync<T, M = any>(
  data:
    | FormData
    | URL
    | URLSearchParams
    | Partial<S>
    | null
    | undefined,
  schema: T,
  options?: SuperValidateOptions
): SuperValidated<T, M>
```

### superValidate options

```ts
SuperValidateOptions = {
  errors?: boolean;   // Add or remove errors from output (valid status is always preserved)
  id?: string;        // Form id, for multiple forms support
  warnings?: {        // Disable warnings
    multipleRegexps?: boolean;
    multipleSteps?: boolean;
  };
}
```

See the page about [multiple forms](/concepts/multiple-forms) for information about when to use `id`.

### superValidate return type

```ts
SuperValidated<T, M = any> = {
  valid: boolean;
  posted: boolean;
  data: S;
  errors: Nested<S, string[] | undefined>;
  constraints: Nested<S, InputConstraints | undefined>;
  message?: M;
  id?: string;
};
```

If data is empty, a `SuperValidated` object with default values for the schema is returned, in this shape:

```js
{
  valid: false;
  posted: false;
  errors: options.errors ? Nested<S, string[] | undefined> : {};
  data: S;
  constraints: Nested<S, InputConstraints>;
  id: undefined;
  message: undefined;
}
```

See [this page](/default-values) for a list of default schema values.

### Input constraints

```ts
/**
 * HTML input constraints returned from superValidate
 * Properties are mapped from the schema:
 */
InputConstraints = Partial<{
  required: boolean; // Not nullable(), nullish() or optional()
  pattern: string; // z.string().regex(r)
  min: number | string; // number if z.number.min(n), ISO date string if z.date().min(d)
  max: number | string; // number if z.number.max(n), ISO date string if z.date().max(d)
  step: number | 'any'; // z.number().step(n)
  minlength: number; // z.string().min(n)
  maxlength: number; // z.string().max(n)
}>;
```

### setError(form, field, error, options?)

```ts
setError(
  form: SuperValidated<T, M>,
  field: '' | FormPathLeaves<S>,
  error: string | string[],
  options?: { overwrite = false, status : NumericRange<400, 599> = 400 }
) : ActionFailure<{form: SuperValidated<T, M>}>
```

For setting errors on the form after validation. It returns a `fail(status, { form })` so it can be returned immediately, or more errors can be added by calling it multiple times before returning.

Use the `overwrite` option to remove all previously set errors for the field, and `status` to set a different status than the default `400` (which must be in the range 400-599).

- To set form-level errors, the `field` argument can be skipped, or set to an empty string.
- To set array-level errors, append `._errors` to the field, like `tags._errors`.

### message(form, message, options?)

```ts
message(
  form: SuperValidated<T, M>,
  message: M,
  options?: { status? : NumericRange<400, 599> }
) : { form: SuperValidated<T, M> } | ActionFailure<{form: SuperValidated<T, M>}>
```

`message` is a convenience method for setting `form.message`, best explained by an example:

```ts
import { message, superValidate } from 'sveltekit-superforms/server';

export const actions = {
  default: async (event) => {
    const form = await superValidate<typeof schema, string>(event, schema);

    if (!form.valid) {
      // Will return fail(400, { form }) since form isn't valid
      return message(form, 'Invalid form');
    }

    if (form.data.email.includes('spam')) {
      // Will return fail and set form.valid = false, since status is >= 400
      return message(form, 'No spam please', {
        status: 403
      });
    }

    // Returns { form }
    return message(form, 'Valid form!');
  }
};
```

Note that the `status` option must be in the range `400-599`.

### defaultValues(schema)

Returns the default values for a schema, either the [Superforms defaults](/default-values) or the ones you set on the schema yourself.

```ts
import { defaultValues } from 'sveltekit-superforms/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  tags: z.string().min(1).array().default(['a', 'b'])
});

// Returns { name: '', tags: ['a', 'b'] }
const defaults = defaultValues(schema);
```

This corresponds to the `form.data` returned from `const form = await superValidate(schema)`.

### actionResult(type, data?, options? | status?)

When using [endpoints](https://kit.svelte.dev/docs/routing#server) instead of form actions, you **must** return an `ActionResult`, for example `throw redirect(...)` won't work, `superForm` expects an `ActionResult`.

This method helps you construct one in a `Response` object, so you can return a validation object from your API/endpoints.

```ts
import { actionResult } from 'sveltekit-superforms/server';

actionResult('success', { form }, (status = 200));
actionResult('failure', { form }, (status = 400));
actionResult('redirect', '/', (status = 303));
actionResult('error', 'Error message', (status = 500));
```

Additionally, the `redirect` version can send a flash message as a third parameter, in case you're using [flash messages](/flash-messages):

```ts
actionResult('redirect', '/', {
  message: App.PageData['flash'],
  status?: 303
});
```

#### Login request example

**src/routes/login/+server.ts**

```ts
import { actionResult, superValidate } from '$lib/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5)
});

export const POST = async ({ request }) => {
  const form = await superValidate(request, loginSchema);
  if (!form.valid) return actionResult('failure', { form });

  // Verify login here //

  return actionResult('success', { form });
};
```

## Client API

```ts
import {
  superForm,
  booleanProxy,
  dateProxy,
  intProxy,
  numberProxy,
  stringProxy,
  fieldProxy,
  formFieldProxy
} from 'sveltekit-superforms/client';
```

The server part of the API can also be imported, for [single-page app](/concepts/spa) usage:

```ts
import {
  superValidate,
  superValidateSync,
  setError,
  setMessage, // Same as message
  actionResult,
  defaultValues
} from 'sveltekit-superforms/client';
```

### superForm(form, options?)

```ts
superForm<T, M = any>(
  form: SuperValidated<T, M> | null | undefined,
  options?: FormOptions<T, M>
) : SuperForm<T, M>
```

### superForm options

```ts
FormOptions<T, M> = Partial<{
  id: string;
  applyAction: boolean;
  invalidateAll: boolean;
  resetForm: boolean | (() => boolean);
  scrollToError: 'auto' | 'smooth' | 'off' | boolean | ScrollIntoViewOptions;
  autoFocusOnError: boolean | 'detect';
  errorSelector: string;
  selectErrorText: boolean;
  stickyNavbar: string;
  taintedMessage: string | false | null;
  SPA: true | { failStatus?: number };

  onSubmit: (
    ...params: Parameters<SubmitFunction>
  ) => MaybePromise<unknown | void>;
  onResult: (event: {
    result: ActionResult;
    formEl: HTMLFormElement;
    cancel: () => void;
  }) => MaybePromise<unknown | void>;
  onUpdate: (event: {
    form: SuperValidated<T, M>;
    formEl: HTMLFormElement;
    cancel: () => void;
  }) => MaybePromise<unknown | void>;
  onUpdated: (event: {
    form: Readonly<SuperValidated<T, M>>;
  }) => MaybePromise<unknown | void>;
  onError:
    | 'apply'
    | ((event: {
        result: {
          type: 'error';
          status?: number;
          error: App.Error;
        };
        message: Writable<SuperValidated<T, M>['message']>;
      }) => MaybePromise<unknown | void>);
  dataType: 'form' | 'json';
  validators: T | false | Validators<T>;
  validationMethod: 'auto' | 'oninput' | 'onblur' | 'submit-only';
  defaultValidator: 'keep' | 'clear';
  clearOnSubmit: 'errors' | 'message' | 'errors-and-message' | 'none';
  delayMs: number;
  timeoutMs: number;
  multipleSubmits: 'prevent' | 'allow' | 'abort';
  syncFlashMessage?: boolean;
  flashMessage: {
    module: import * as flashModule from 'sveltekit-flash-message/client';
    onError?: (event: {
      result: {
        type: 'error';
        status?: number;
        error: App.Error;
      };
      message: Writable<App.PageData['flash']>;
    }) => MaybePromise<unknown | void>;
    cookiePath?: string;
    cookieName?: string;
  };
  warnings: {
    duplicateId?: boolean;
    noValidationAndConstraints?: boolean;
  };
}>;
```

### superForm return type

```ts
SuperForm<T extends AnyZodObject, M = any> = {
  form: {
    subscribe: (data: S) => void
    set: (value: S, options?: { taint?: boolean | 'untaint' | 'untaint-all' }) => void
    update: (updater: (S) => S, options?: { taint?: boolean | 'untaint' | 'untaint-all' }) => void
  };
  formId: Writable<string | undefined>;
  errors: Writable<Nested<S, string[] | undefined>>;
  constraints: Writable<Nested<S, InputConstraints | undefined>>;
  message: Writable<M | undefined>;
  tainted: Writable<Nested<S, boolean | undefined> | undefined>;
  meta: Readable<{ types: Record<keyof S, string> | undefined }>;

  submitting: Readable<boolean>;
  delayed: Readable<boolean>;
  timeout: Readable<boolean>;
  posted: Readable<boolean>;

  fields: Record<keyof S, FormField<T>>;
  allErrors: Readable<{ path: string; messages: string[] }[]>;

  options: FormOptions<T, M>;

  enhance: (el: HTMLFormElement, {
    onSubmit, onResult, onError, onUpdate, onUpdated
  }) => ReturnType<typeof $app/forms/enhance>;

  reset: (options?: {
    keepMessage?: boolean;
    id?: string;
    data?: Partial<S>;
  }) => void;

  capture: () => SuperFormSnapshot<T, M>;
  restore: (snapshot: SuperFormSnapshot<T, M>) => void;

  validate: (path?: FormPathLeaves<S>, opts?: {
    value: FormPathType<FormPathLeaves<S>>;
    update: boolean | 'errors' | 'value';
    taint: boolean | 'untaint' | 'untaint-all';
    errors: string | string[];
  }) => Promise<(string[] | undefined) | SuperValidated<T, M>>;
};

FormField<S, Prop extends keyof S> = {
  readonly name: Prop;
  value: Writable<S[Prop]>;
  errors?: Writable<ValidationErrors<S[Prop]>>;
  constraints?: Writable<InputConstraints<S[Prop]>>;
};
```

## Proxy objects

The general way of creating a proxy is like this:

```svelte
<script lang="ts">
  import { superForm, intProxy } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form, enhance } = superForm(data.form);

  // All proxies are of type Writable<string>
  const proxy = intProxy(form, 'field', { options });
</script>

<input name="field" bind:value={$proxy} />
```

Changes in either the proxy store or the corresponding `$form` field will reflect in the other.

### intProxy(form, fieldName, options?)

Creates a string store for an **integer** field in the schema.

**Options:**

```ts
{ 
  empty?: 'null' | 'undefined'; 
}
```

An intProxy is rarely needed as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs) with `bind:value`. Note that the `empty` option includes the number zero.

### numberProxy(form, fieldName, options?)

Creates a string store for a **number** field in the schema.

**Options:**

```ts
{ 
  empty?: 'null' | 'undefined'; 
  delimiter?: '.' | ',';
}
```

A numberProxy is rarely needed as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs) with `bind:value`. Note that `empty` option includes the number zero.

### booleanProxy(form, fieldName, options?)

**Options:**

```ts
{
  trueStringValue = 'true';
}
```

Creates a string store for a **boolean** schema field. The option can be used to change what string value should represent `true`. An empty string represents `false`.

### dateProxy(form, fieldName, options?)

Creates a string store for a **Date** schema field. The option can be used to change the proxied string format of the date.

**Options:**

```ts
{
  format:
    // Extract the part of the date as a substring:
    | 'date' | 'datetime' | 'time'
    // Convert the date to UTC:
    | 'date-utc' | 'datetime-utc' | 'time-utc'
    // Convert the date to local time:
    | 'date-local' | 'datetime-local' | 'time-local'
    // The default ISODateString:
    | 'iso' = 'iso';
  empty?: 'null' | 'undefined'
}
```

### stringProxy(form, fieldName, options)

Creates a string store for a **string** schema field. It may look redundant, but the option can be useful if you need to convert an empty string to `null` or `undefined`.

**Options:**

```ts
{
  empty: 'null' | 'undefined';
}
```

### fieldProxy, formFieldProxy

See the dedicated article for documentation about [fieldProxy](/components#using-a-fieldproxy) and [formFieldProxy](/components#using-a-formfieldproxy).

## Proxy example

Given the following schema:

```ts
const schema = z.object({
  date: z.date()
});
```

A proxy for a [HTML date field](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date) can be used like this:

```svelte
<script lang="ts">
  import { superForm, dateProxy } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form, enhance } = superForm(data.form);
  const date = dateProxy(form, 'date', { format: 'date', empty: 'undefined' });
</script>

<input name="date" type="date" bind:value={$date} />
```

## Components

### SuperDebug

`SuperDebug` is a must-have debugging component that gives you colorized and nicely formatted output for any data structure, usually `$form`. 

More information and usage examples can be found [on the SuperDebug page](/super-debug).
