<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# API reference

<Head title="API reference" />

Throughout the reference, the type `T` represents the type of the validation schema, extending `Record<string, unknown>`. For example, in a form with name and email, name being optional:

```ts
type T = {
  name?: string | undefined,
  email: string
};
```

The `Nested<T, R>` type replaces all primitive values of `T` with `R`, and removes any optional modifier. In the above example:

```ts
type Nested<T, string[]> = {
  name: string[],
  email: string[]
};
```

The type `M` represents the [status message](/concepts/messages/) type, default `any`.

```ts
type M = any;
```

A `ValidationAdapter<T, In>` and `ClientValidationAdapter<T, In>` are the adapters used to wrap the schema, based on the selected validation library. `In` is the input type of the schema, as transformations and pipes can make it differ from `T`, but usually they are the same. Example:

```ts
import type { Infer, InferIn } from 'sveltekit-superforms';
import { zod, zodClient } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3)
})

// Type is now ValidationAdapter<Infer<typeof schema>, InferIn<typeof schema>>
// Which is the same as ValidationAdapter<{name: string}, {name: string}>
const adapter = zod(schema);
```

## Server API

```ts
import {
  superValidate,
  actionResult,
  defaultValues,
  message,
  setError,
  fail,
  withFiles
} from 'sveltekit-superforms';
```

### superValidate(adapter | data, adapter? | options?, options?)

If you want the form to be initially empty, you can pass the adapter as the first parameter:

```ts
superValidate<T, M = any, In = T>(
  adapter: ValidationAdapter<T, In>,
  options?: SuperValidateOptions
): Promise<SuperValidated<T, M, In>>
```

If you want to populate the form, for example, from a database, `URL` parameters in the load function, or `FormData` in the form actions, send the data as the first parameter and the adapter second:

```ts
superValidate<T, M = any, In = T>(
  data:
    | RequestEvent
    | Request
    | FormData
    | URL
    | URLSearchParams
    | Partial<In>
    | null
    | undefined,
  adapter: ValidationAdapter<T, In>,
  options?: SuperValidateOptions
): Promise<SuperValidated<T, M, In>>
```

### superValidate options

```ts
SuperValidateOptions = Partial<{
  errors: boolean;           // Add or remove errors from output (valid status is always preserved)
  id: string;                // Form id, for multiple forms support. Set automatically by default
  preprocessed: (keyof T)[]; // Bypass superValidate data coercion for posted fields in this array
  defaults: T;               // Override default values from the schema
  jsonSchema: JSONSchema;    // Override JSON schema from the adapter
  strict: boolean;           // If true, validate exactly the posted data, no defaults added
  allowFiles: boolean;       // If false, set all posted File objects to undefined
  transport: Transport;      // Set to a transport object to send any type to the client. See https://svelte.dev/docs/kit/hooks#Universal-hooks-transport
}>
```

See the page about [multiple forms](/concepts/multiple-forms) for information about when to use `id`.

### superValidate return type

```ts
SuperValidated<T, M = any, In = T> = {
  id: string;
  valid: boolean;
  posted: boolean;
  data: T;
  errors: Nested<T, string[] | undefined>;
  constraints?: Nested<T, InputConstraints | undefined>;
  message?: M;
};
```

If data is empty, a `SuperValidated` object with default values for the schema is returned:

```js
{
  id: string;
  valid: false;
  posted: false;
  errors: options.errors ? Nested<T, string[] | undefined> : {};
  data: T;
  constraints: Nested<T, InputConstraints>;
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
  required: boolean; // true if not nullable or optional
  pattern: string; // string validator with RegExp pattern
  min: number | string; // number or ISO date string depending on type
  max: number | string; // number or ISO date string depending on type
  step: number | 'any'; // number validator with step constraint
  minlength: number; // string validator
  maxlength: number; // string validator
}>;
```

### setError(form, field, error, options?)

```ts
setError(
  form: SuperValidated<T, M, In>,
  field: '' | FormPathLeaves<T>,
  error: string | string[],
  options?: { overwrite = false, status : ErrorStatus = 400 }
) : ActionFailure<{form: SuperValidated<T, M, In>}>
```

For setting errors on the form after validation. It returns a `fail(status, { form })` so it can be returned immediately, or more errors can be added by calling it multiple times before returning. `form.valid` will also be set to `false`.

Use the `overwrite` option to remove all previously set errors for the field, and `status` to set a different status than the default `400` (which must be in the range 400-599).

- To set a form-level error, the `field` argument can be skipped, or set to an empty string.
- To set an array-level error, append `._errors` to the field parameter, like `"tags._errors"`.

### message(form, message, options?)

```ts
message(
  form: SuperValidated<T, M, In>,
  message: M,
  options?: { status? : NumericRange<400, 599> }
) : { form: SuperValidated<T, M, In> } | ActionFailure<{form: SuperValidated<T, M, In>}>
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
import { defaultValues } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  tags: z.string().min(1).array().default(['a', 'b'])
});

// Returns { name: '', tags: ['a', 'b'] }
const defaults = defaultValues(zod(schema));
```

This corresponds to the `form.data` returned from `const form = await superValidate(zod(schema))`.

### actionResult(type, data?, options? | status?)

When using an [endpoint](https://kit.svelte.dev/docs/routing#server) (a `+server.ts` file) instead of form actions, you must return an `ActionResult` to a form that has `use:enhance` applied. Anything else won't work, not even throwing a redirect, since superForm expects an ActionResult.

The `actionResult` function helps you construct one in a `Response` object, so you can return a validation object from your API/endpoints.

```ts
import { actionResult } from 'sveltekit-superforms';

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
import { actionResult, superValidate, setMessage } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5)
});

export const POST = async ({ request }) => {
  const form = await superValidate(request, zod(loginSchema));
  if (!form.valid) return actionResult('failure', { form });

  // TODO: Verify login here //

  setMessage(form, 'Login successful!');
  return actionResult('success', { form });
};
```

Then in the form, simply point the form action to the endpoint (and remember `use:enhance`):

```svelte
<form method="POST" action="/login" use:enhance>
  <!-- Business as usual -->
```

## Client API

```ts
import { 
  superForm, 
  defaults
} from 'sveltekit-superforms';
```

### superForm(form, options?)

```ts
superForm<T, M = any>(
  form: SuperValidated<T, M, In> | null | undefined,
  options?: FormOptions<T, M, In>
) : SuperForm<T, M>
```

### superForm options

```ts
type FormOptions<T, M, In> = Partial<{
  // Basics
  id: string;
  applyAction: boolean;
  invalidateAll: boolean | 'force';
  resetForm: boolean | (() => boolean);
  taintedMessage: boolean | string | (() => Promise<boolean>);
  dataType: 'form' | 'json';
  multipleSubmits: 'prevent' | 'allow' | 'abort';
  SPA: true;

  // Error handling
  scrollToError: 'auto' | 'smooth' | 'off' | boolean | ScrollIntoViewOptions;
  autoFocusOnError: 'detect' | boolean;
  errorSelector: string;
  selectErrorText: boolean;
  stickyNavbar: string;

  // Events
  onSubmit: (
    submit: Parameters<SubmitFunction>[0] & { 
      jsonData: (data: Record<string, unknown>) => void,
      validators: (validators: ValidationAdapter<Partial<T>, Record<string, unknown>> | false) => void,
      customRequest: (input: Parameters<SubmitFunction>[0]) => Promise<Response | XMLHttpRequest>
    }
  ) => MaybePromise<unknown | void>;
  onResult: (event: {
    result: ActionResult;
    formEl: HTMLFormElement;
    cancel: () => void;
  }) => MaybePromise<unknown | void>;
  onUpdate: (event: {
    form: SuperValidated<T, M, In>;
    formEl: HTMLFormElement;
    cancel: () => void;
    result: Extract<ActionResult, { type: 'success' | 'failure' }>;
  }) => MaybePromise<unknown | void>;
  onUpdated: (event: {
    form: Readonly<SuperValidated<T, M, In>>;
  }) => MaybePromise<unknown | void>;
  onChange: (event: ChangeEvent) => void;
  onError:
    | 'apply'
    | ((event: {
        result: {
          type: 'error';
          status?: number;
          error: App.Error | Error | { message: string };
        };
        message: Writable<SuperValidated<T, M, In>['message']>;
      }) => MaybePromise<unknown | void>);

  // Client-side validation
  validators:
    | ClientValidationAdapter<Partial<T>, Record<string, unknown>>
    | ValidationAdapter<Partial<T>, Record<string, unknown>>
    | false
    | 'clear';
  validationMethod: 'auto' | 'oninput' | 'onblur' | 'onsubmit';
  clearOnSubmit: 'errors-and-message' | 'message' | 'errors' | 'none';
  delayMs: number;
  timeoutMs: number;

  // For handling arbitrary types in the form. (See nested data)
  transport: Transport;

  // Disable warnings
  warnings: {
    duplicateId?: boolean;
  };
}>;

type ChangeEvent<T> =
{
  path: FormPath<T>;
  paths: FormPath<T>[];
  formElement: HTMLFormElement;
  target: Element;
  set: <Path extends FormPath<T>>(
    path: Path,
    value: FormPathType<T, Path>,
    options?: { taint?: boolean | 'untaint' | 'untaint-form' }
  ) => void;
  get: <Path extends FormPath<T>>(path: Path) => FormPathType<T, Path>;
} | {
  target: undefined;
  paths: FormPath<T>[];
  set: <Path extends FormPath<T>>(
    path: Path,
    value: FormPathType<T, Path>,
    options?: { taint?: boolean | 'untaint' | 'untaint-form' }
  ) => void;
  get: <Path extends FormPath<T>>(path: Path) => FormPathType<T, Path>;
};
```

- See [SubmitFunction](https://kit.svelte.dev/docs/types#public-types-submitfunction) for details about the `onSubmit` arguments, and [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) for `onResult`.
- See the SvelteKit [transport](https://svelte.dev/docs/kit/hooks#Universal-hooks-transport) feature for how to send any type of form data to the server, using the `transport` option.

### superForm return type

```ts
SuperForm<T, M = any, In = T> = {
  form: {
    subscribe: (data: T) => void
    set: (value: T, options?: { taint?: boolean | 'untaint' | 'untaint-form' }) => void
    update: (updater: (T) => T, options?: { taint?: boolean | 'untaint' | 'untaint-form' }) => void
  };
  errors: Writable<Nested<T, string[] | undefined>>;
  constraints: Writable<Nested<T, InputConstraints | undefined>>;
  message: Writable<M | undefined>;
  tainted: Writable<Nested<T, boolean | undefined> | undefined>;

  submitting: Readable<boolean>;
  delayed: Readable<boolean>;
  timeout: Readable<boolean>;
  posted: Readable<boolean>;

  formId: Writable<string>;
  allErrors: Readable<{ path: string; messages: string[] }[]>;

  options: FormOptions<T, M, In>;

  enhance: (el: HTMLFormElement, events?: {
    onSubmit, onResult, onError, onUpdate, onUpdated
  }) => ReturnType<typeof $app/forms/enhance>;

  reset: (options?: {
    keepMessage?: boolean;
    id?: string;
    data?: Partial<T>;
    newState?: Partial<T>;
  }) => void;

  isTainted: (path?: FormPath<T> | TaintedFields<T> | boolean) => boolean;

  submit: (submitter?: HTMLElement | Event | EventTarget | null | undefined) => void;

  capture: () => SuperFormSnapshot<T, M>;
  restore: (snapshot: SuperFormSnapshot<T, M>) => void;

  validateForm: (opts?: {
    update?: boolean;
    schema?: ValidationAdapter<Partial<T>>;
    focusOnError?: boolean;
  }) => Promise<SuperValidated<T, M, In>>;

  validate: (path: FormPathLeaves<T>, opts?: {
    value: FormPathType<FormPathLeaves<T>>;
    update: boolean | 'errors' | 'value';
    taint: boolean | 'untaint' | 'untaint-form';
    errors: string | string[];
  }) => Promise<string[] | undefined>;
};
```

### reset

Calling the reset method without any arguments will reset the form to its initial values, but you can also reset to a different set of data, which is useful if the form data should change depending on external events.

**Options:**

```ts
{ 
  keepMessage?: boolean;
  id?: string;
  data?: Partial<T>;
  newState?: Partial<T>;
}
```

You have the option to keep the [status message](/concepts/messages) and change the [form id](/concepts/multiple-forms), and reset to new data with the `data` option. The `newState` option also updates the initial reset data, so when you call `reset` in the future, it will reset to that state. So if you want the new data to be the base for future resets, set both `data` and `newState`.

### defaults

The `defaults` function can be useful on the client in Svelte components and [SPA mode](/concepts/spa), since components cannot have top-level `await`.

```ts
defaults<T, M = any>(
  data:
    | Partial<T>
    | null
    | undefined,
  schema: ClientValidationAdapter<T>,
  options?: SuperValidateOptions
): SuperValidated<T, M, In>
```

## Proxy objects

```ts
import {
  // The primitives return a Writable<string>:
  booleanProxy,
  dateProxy,
  intProxy,
  numberProxy,
  stringProxy,
  // File proxies
  fileProxy,
  fileFieldProxy, // formFieldProxy
  // File[] proxies
  filesProxy,
  filesFieldProxy, // arrayProxy
  // The type of the others depends on the field:
  formFieldProxy,
  arrayProxy,
  fieldProxy      
} from 'sveltekit-superforms';
```

A proxy handles bi-directional updates and data transformation of a corresponding form field. Updates in either the proxy or data it points to, will reflect in the other.

### intProxy(form, fieldName, options?)

Creates a string store for an **integer** field in the schema. It's rarely needed as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs) with `bind:value`. 

```ts
import { superForm, intProxy } from 'sveltekit-superforms';
let { data } = $props();

const { form } = superForm(data.form);
const proxy = intProxy(form, 'field', { options });
```

**Options:**

```ts
{ 
  empty?: 'null' | 'undefined' | 'zero';
  initiallyEmptyIfZero?: boolean;
  taint?: boolean | 'untaint' | 'untaint-form';
}
```

Use the `empty` option to set the field to some of the defined values. Use `initiallyEmptyIfZero` to set the field to empty if the initial value is zero, to show the placeholder text, usually in combination with the `empty` option being set to `'zero'`.

### numberProxy(form, fieldName, options?)

Creates a string store for a **number** field in the schema. It's rarely needed as Svelte [handles this automatically](https://svelte.dev/tutorial/numeric-inputs) with `bind:value`. 

```ts
import { superForm, numberProxy } from 'sveltekit-superforms';
let { data } = $props();

const { form } = superForm(data.form);
const proxy = numberProxy(form, 'field', { options });
```

**Options:**

```ts
{ 
  empty?: 'null' | 'undefined' | 'zero';
  initiallyEmptyIfZero?: boolean;
  taint?: boolean | 'untaint' | 'untaint-form';
}
```

Use the `empty` option to set the field to some of the defined values. Use `initiallyEmptyIfZero` to set the field to empty if the initial value is zero, to show the placeholder text, usually in combination with the `empty` option being set to `'zero'`.

### booleanProxy(form, fieldName, options?)

Creates a string store for a **boolean** schema field. The option can be used to change what string value should represent `true`. An empty string always represents `false`.

```ts
import { superForm, booleanProxy } from 'sveltekit-superforms';
let { data } = $props();

const { form } = superForm(data.form);
const proxy = booleanProxy(form, 'field', { options });
```

**Options:**

```ts
{
  trueStringValue = 'true';
  taint?: boolean | 'untaint' | 'untaint-form';
}
```

### dateProxy(form, fieldName, options?)

Creates a string store for a **Date** schema field. The option can be used to change the proxied string format of the date.

```ts
import { superForm, dateProxy } from 'sveltekit-superforms';
let { data } = $props();

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
  empty?: 'null' | 'undefined';
  taint?: boolean | 'untaint' | 'untaint-form';
}
```

### stringProxy(form, fieldName, options)

Creates a string store for a **string** schema field. It may look redundant, but the option can be useful if you need to convert an empty string to `null` or `undefined`.

```ts
import { superForm, stringProxy } from 'sveltekit-superforms';
let { data } = $props();

const { form } = superForm(data.form);
const proxy = stringProxy(form, 'field', { options });
```

**Options:**

```ts
{
  empty: 'null' | 'undefined';
  taint?: boolean | 'untaint' | 'untaint-form';
}
```

### formFieldProxy(superForm, fieldName, options)

Proxies a form field, returning stores similar to `superForm` but for a single field. For arrays in the schema, see below for how to create an `arrayProxy`.

> The whole object returned from `superForm` is required here, not just the `$form` store.

```svelte
<script lang="ts">
  import { superForm, formFieldProxy } from 'sveltekit-superforms';

  let { data } = $props();

  const superform = superForm(data.form); // The whole superForm object is required
  const { form } = superform; // Deconstruct as usual here

  const { path, value, errors, constraints, tainted } = formFieldProxy(superform, 'name');
</script>
```

**Options:**

```ts
{
  taint?: boolean | 'untaint' | 'untaint-all';
}
```

The option can be used to prevent tainting the form when modifying the proxy.

For more details about formFieldProxy, see the [components page](/components#using-a-formfieldproxy). 

### arrayProxy(superForm, fieldName, options)

Proxies an array in a form, returning stores similar to `superForm` but for the array.

> The whole object returned from `superForm` is required here, not just the `$form` store.

```svelte
<script lang="ts">
  import { superForm, arrayProxy } from 'sveltekit-superforms';

  let { data } = $props();

  const superform = superForm(data.form); // The whole superForm object is required
  const { form } = superform; // Deconstruct as usual here

  const { path, values, errors, valueErrors } = arrayProxy(superform, 'tags');
</script>
```

- `errors` displays errors for the *array itself*, for example if the number of items are too few.
- `valueErrors` is an array that lists errors for the *content* of the array.

**Options:**

```ts
{
  taint?: boolean | 'untaint' | 'untaint-all';
}
```

The option can be used to prevent tainting the form when modifying the proxy.

An example of how to use `arrayProxy` in a component is available [on Stackblitz](https://stackblitz.com/edit/sveltekit-superforms-multi-select?file=src%2Froutes%2F%2Bpage.svelte,src%2Froutes%2FMultiSelect.svelte).

### fieldProxy(object, fieldName)

Proxies field access in any object, usually in `$form`, but in that case `formFieldProxy` and `arrayProxy` are more convenient.

```svelte
<script lang="ts">
  import { superForm, fieldProxy } from 'sveltekit-superforms';
  let { data } = $props();

  const { form } = superForm(data.form);

  // Proxy any field in an object
  const nameProxy = fieldProxy(form, 'name');
</script>
```

**Options:**

```ts
{
  taint?: boolean | 'untaint' | 'untaint-all';
}
```

## Proxy example

Given the following schema:

```ts
const schema = z.object({
  date: z.date().optional()
});
```

A proxy for a [HTML date field](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date) can be used like this:

```svelte
<script lang="ts">
  import { superForm, dateProxy } from 'sveltekit-superforms';
  import type { PageData } from './$types.js';

  let { data } = $props();

  const { form, enhance } = superForm(data.form);
  const date = dateProxy(form, 'date', { format: 'date', empty: 'undefined' });
</script>

<input name="date" type="date" bind:value={$date} />
```

## Components

### SuperDebug

`SuperDebug` is a must-have debugging component that gives you colorized and nicely formatted output for any data structure, usually `$form`. 

More information and usage examples can be found [on the SuperDebug page](/super-debug).
