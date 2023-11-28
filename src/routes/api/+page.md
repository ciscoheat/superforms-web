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
  errors?: boolean;          // Add or remove errors from output (valid status is always preserved)
  id?: string;               // Form id, for multiple forms support
  preprocessed?: (keyof S)[] // Bypass superValidate data coercion for posted fields in this array
  warnings?: {               // Disable warnings
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

- To set a form-level error, the `field` argument can be skipped, or set to an empty string.
- To set an array-level error, append `._errors` to the field parameter, like `"tags._errors"`.

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

When using an [endpoint](https://kit.svelte.dev/docs/routing#server) (a `+server.ts` file) instead of form actions, you must return an `ActionResult` to a form that has `use:enhance` applied. Anything else won't work, not even throwing a redirect, since superForm expects an ActionResult.

The `actionResult` function helps you construct one in a `Response` object, so you can return a validation object from your API/endpoints.

```ts
import { actionResult } from 'sveltekit-superforms/server';

actionResult('success', { form }, 200);
actionResult('failure', { form }, 400);
actionResult('redirect', '/', 303);
actionResult('error', 'Error message', 500);
```

The default status codes for each result type are shown, so you don't need to include them if they're the same.

Additionally, the `redirect` version can send a flash message as a third parameter, in case you're using [flash messages](/flash-messages). It can also set options for the flash cookie that's being set.

```ts
actionResult('redirect', '/', {
  message: { type: 'success', text: 'Posted successfully!' },
  cookieOptions: { sameSite: 'lax' }
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
import { superForm } from 'sveltekit-superforms/client';
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
  // Basics
  id: string;
  applyAction: boolean;
  invalidateAll: boolean;
  resetForm: boolean | (() => boolean);
  taintedMessage: string | false | null;
  dataType: 'form' | 'json';
  multipleSubmits: 'prevent' | 'allow' | 'abort';
  SPA: true | { failStatus?: number };

  // Error handling
  scrollToError: 'auto' | 'smooth' | 'off' | boolean | ScrollIntoViewOptions;
  autoFocusOnError: boolean | 'detect';
  errorSelector: string;
  selectErrorText: boolean;
  stickyNavbar: string;

  // Events
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

  // Client-side validation
  validators: T | false | Validators<T>;
  validationMethod: 'auto' | 'oninput' | 'onblur' | 'submit-only';
  defaultValidator: 'keep' | 'clear';
  clearOnSubmit: 'errors' | 'message' | 'errors-and-message' | 'none';
  delayMs: number;
  timeoutMs: number;

  // Flash message integration
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

  // Disable warnings
  warnings: {
    duplicateId?: boolean;
    noValidationAndConstraints?: boolean;
  };
}>;
```

See [SubmitFunction](https://kit.svelte.dev/docs/types#public-types-submitfunction) for details about the `onSubmit` arguments, and [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) for `onResult`.

### superForm return type

```ts
SuperForm<T extends AnyZodObject, M = any> = {
  form: {
    subscribe: (data: S) => void
    set: (value: S, options?: { taint?: boolean | 'untaint' | 'untaint-all' }) => void
    update: (updater: (S) => S, options?: { taint?: boolean | 'untaint' | 'untaint-all' }) => void
  };
  errors: Writable<Nested<S, string[] | undefined>>;
  constraints: Writable<Nested<S, InputConstraints | undefined>>;
  message: Writable<M | undefined>;
  tainted: Writable<Nested<S, boolean | undefined> | undefined>;

  submitting: Readable<boolean>;
  delayed: Readable<boolean>;
  timeout: Readable<boolean>;
  posted: Readable<boolean>;

  formId: Writable<string | undefined>;
  fields: Record<keyof S, FormField<T>>;
  allErrors: Readable<{ path: string; messages: string[] }[]>;

  options: FormOptions<T, M>;

  enhance: (el: HTMLFormElement, events?: {
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

```ts
import {
  // The first ones uses the $form store
  // and is always a Writable<string>:
  booleanProxy,
  dateProxy,
  intProxy,
  numberProxy,
  stringProxy,
  // Uses the whole object returned from superForm.
  // Type depends on the field.
  formFieldProxy,
  arrayProxy,
  // Can use any object. Type depends on the field.
  fieldProxy      
} from 'sveltekit-superforms/client';
```

A proxy handles bi-directional updates and data transformation of a corresponding form field. Updates in either the proxy or data it points to, will reflect in the other.

### intProxy(form, fieldName, options?)

Creates a string store for an **integer** field in the schema. It's rarely needed as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs) with `bind:value`. 

```ts
import { superForm, intProxy } from 'sveltekit-superforms/client';
export let data;

const { form } = superForm(data.form);
const proxy = intProxy(form, 'field', { options });
```

**Options:**

```ts
{ 
  empty?: 'null' | 'undefined';
  emptyIfZero?: boolean = true;
}
```

Use the `empty` option to set the field to `null` or `undefined` if the value is falsy. (Which includes the number zero, unless `emptyIfZero` is set to `false`.)

### numberProxy(form, fieldName, options?)

Creates a string store for a **number** field in the schema. It's rarely needed as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs) with `bind:value`. 

```ts
import { superForm, numberProxy } from 'sveltekit-superforms/client';
export let data;

const { form } = superForm(data.form);
const proxy = numberProxy(form, 'field', { options });
```

**Options:**

```ts
{ 
  empty?: 'null' | 'undefined';
  emptyIfZero?: boolean = true;
  delimiter?: '.' | ',';
}
```

Use the `empty` option to set the field to `null` or `undefined` if the value is falsy. (Which includes the number zero, unless `emptyIfZero` is set to `false`.)

### booleanProxy(form, fieldName, options?)

Creates a string store for a **boolean** schema field. The option can be used to change what string value should represent `true`. An empty string always represents `false`.

```ts
import { superForm, booleanProxy } from 'sveltekit-superforms/client';
export let data;

const { form } = superForm(data.form);
const proxy = booleanProxy(form, 'field', { options });
```

**Options:**

```ts
{
  trueStringValue = 'true';
}
```

### dateProxy(form, fieldName, options?)

Creates a string store for a **Date** schema field. The option can be used to change the proxied string format of the date.

```ts
import { superForm, dateProxy } from 'sveltekit-superforms/client';
export let data;

const { form } = superForm(data.form);
const proxy = dateProxy(form, 'field', { options });
```

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

```ts
import { superForm, stringProxy } from 'sveltekit-superforms/client';
export let data;

const { form } = superForm(data.form);
const proxy = stringProxy(form, 'field', { options });
```

**Options:**

```ts
{
  empty: 'null' | 'undefined';
}
```

### formFieldProxy(superForm, fieldName, options)

Proxies a form field, returning stores similar to `superForm` but for a single field. For arrays in the schema, see below for how to create an `arrayProxy`.

> The whole object returned from `superForm` is required here, not just the `$form` store.

```svelte
<script lang="ts">
  import { superForm, formFieldProxy } from 'sveltekit-superforms/client';

  export let data;

  const theForm = superForm(data.form); // The whole superForm object is required
  const { form } = theForm; // Deconstruct as usual here

  const { path, value, errors, constraints, tainted } = formFieldProxy(theForm, 'name');
</script>
```

**Options:**

```ts
{
  taint: boolean | 'untaint' | 'untaint-all' = true;
}
```

The option can be used to prevent tainting the form when modifying the proxy.

For more details about formFieldProxy, see the [components page](/components#using-a-formfieldproxy). 

### arrayProxy(superForm, fieldName, options)

Proxies an array in a form, returning stores similar to `superForm` but for the array.

> The whole object returned from `superForm` is required here, not just the `$form` store.

```svelte
<script lang="ts">
  import { superForm, arrayProxy } from 'sveltekit-superforms/client';

  export let data;

  const theForm = superForm(data.form); // The whole superForm object is required
  const { form } = theForm; // Deconstruct as usual here

  const { path, values, errors, fieldErrors } = arrayProxy(theForm, 'tags');
</script>
```

- `errors` displays errors for the *array itself*, for example if the number of items are too few.
- `fieldErrors` is an array that lists errors for the *contents* of the array.

**Options:**

```ts
{
  taint: boolean | 'untaint' | 'untaint-all' = true;
}
```

The option can be used to prevent tainting the form when modifying the proxy.

An example of how to use `arrayProxy` in a component is available [on Stackblitz](https://stackblitz.com/edit/sveltekit-superforms-multi-select?file=src%2Froutes%2F%2Bpage.svelte,src%2Froutes%2FMultiSelect.svelte).

### fieldProxy(object, fieldName)

Proxies field access in any object, usually in `$form`, but in that case `formFieldProxy` and `arrayProxy` are more convenient.

```svelte
<script lang="ts">
  import { superForm, fieldProxy } from 'sveltekit-superforms/client';
  export let data;

  const { form } = superForm(data.form);

  // Proxy any field in an object
  const nameProxy = fieldProxy(form, 'name');
</script>
```

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
