# API reference

<svelte:head><title>API reference</title></svelte:head>

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
```

## Server API

```ts
import {
  superValidate,
  setError,
  message,
  actionResult
} from 'sveltekit-superforms/server';
```

### superValidate(schema | data, schema? | options?, options?)

If you want the form to be initially empty, you can pass the schema as the first parameter:

```ts
superValidate<T, M = any>(
  schema: T,
  options?: SuperValidateOptions
): Promise<Validation<T, M>>
```

If you want to populate the form, for example from a database or `URL` parameters in the load function, or `FormData` in the form actions, send the data as the first parameter, the schema second:

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
): Promise<Validation<T, M>>
```

Options:

```ts
SuperValidateOptions = {
  id?: string          // Form id, for multiple forms support
  errors?: boolean     // Add or remove errors from output (preserves valid status)
  includeMeta = false; // Add metadata to the validation object
}
```

See [this page](/concepts/multiple-forms) for information about `id` and multiple forms on the same page.

#### Error and data behavior

- If the data passed to `superValidate` **is not** empty, errors will be returned unless the `errors` option is `false`.
- Vice versa, if the data **is** empty, no errors will be returned unless `errors` is `true`.

This does not affect the `valid` property of the `Validation` object, which always indicates whether validation succeeded or not.

### Return value from superValidate

```ts
Validation<T, M = any> = {
  valid: boolean;
  empty: boolean;
  data: S;
  errors: Nested<S, string[] | undefined>;
  constraints: Nested<S, InputConstraints | undefined>;
  message?: M;
  id?: string;
  meta?: { types: Nested<S, string> }
};
```

If data is empty, a `Validation` object with default values for the schema is returned, in this shape:

```js
{
  valid: false;
  empty: true;
  errors: options.errors ? Nested<S, string[] | undefined> : {};
  data: S;
  constraints: Nested<S, InputConstraints>;
  id?: undefined;
  message?: undefined;
  meta?: { types: Record<keyof S, string> }
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
  step: number; // z.number().step(n)
  minlength: number; // z.string().min(n)
  maxlength: number; // z.string().max(n)
}>;
```

### setError(form, field, error, options?)

```ts
setError(
  form: Validation<T, M>,
  field: keyof S | [keyof S, ...(string | number)[]] | [] | null,
  error: string | string[],
  options?: { overwrite = false, status = 400 }
) : ActionFailure<{form: Validation<T, M>}>
```

For setting errors on the form after validation. It returns a `fail(status, { form })` so it can be returned immediately, or more errors can be added by calling it multiple times before returning.

Use the `overwrite` option to remove all previously set errors for the field, and `status` to set a different status than the default `400`.

If the `field` argument is set to an empty array or `null`, the error will be a form-level error that can be accessed on the client with `$errors._errors`.

### message(form, message, options?)

```ts
message(
  form: Validation<T, M>,
  message: M,
  options?: { status? : number }
) : { form: Validation<T, M> } | ActionFailure<{form: Validation<T, M>}>
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
      // Will also return fail, since status is >= 400
      return message(form, 'No spam please', {
        status: 403
      });
    }

    // Returns { form }
    return message(form, 'Valid form!');
  }
};
```

### actionResult(type, data?, options? | status?)

When using [endpoints](https://kit.svelte.dev/docs/routing#server) instead of form actions, you **must** return an `ActionResult`, `throw redirect(...)` won't work for example, `superForm` expects an `ActionResult`.

This method helps you construct one in a `Response` object, so you can return a validation object from your API/endpoints.

```ts
actionResult('success', { form }, (status = 200));
actionResult('failure', { form }, (status = 400));
actionResult('redirect', '/', (status = 303));
actionResult('error', 'Error message', (status = 500));
```

Additionally, the `redirect` version can send a flash message as a third parameter, in case you're using [flash messages](/flash-messages):

```ts
actionResult('redirect', '/', {
  message: App.PageData['flash'],
  status = 303
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
  intProxy,
  numberProxy,
  booleanProxy,
  dateProxy,
  fieldProxy,
  formFieldProxy
} from 'sveltekit-superforms/client';
```

The server part of the API can also be imported, for [single-page app](/concepts/spa) usage:

```ts
import {
  superValidate,
  setError,
  setMessage, // Same as message
  actionResult
} from 'sveltekit-superforms/client';
```

### superForm(form, options?)

```ts
superForm<T, M = any>(
  form: Validation<T, M> | null | undefined,
  options?: FormOptions<T, M>
) : SuperForm<T, M>
```

```ts
FormOptions<T, M> = Partial<{
  id: string;
  applyAction: boolean;
  invalidateAll: boolean;
  resetForm: boolean | (() => MaybePromise<boolean>);
  scrollToError: 'auto' | 'smooth' | 'off';
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
    form: Validation<T, M>;
    formEl: HTMLFormElement;
    cancel: () => void;
  }) => MaybePromise<unknown | void>;
  onUpdated: (event: {
    form: Readonly<Validation<T, M>>;
  }) => MaybePromise<unknown | void>;
  onError:
    | 'apply'
    | ((event: {
        result: {
          type: 'error';
          status?: number;
          error: App.Error;
        };
        message: Writable<Validation<T, M>['message']>;
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
    module: {
      getFlash(page: Readable<Page>): Writable<App.PageData['flash']>;
      updateFlash(
        page: Readable<Page>,
        update?: () => Promise<void>
      ): Promise<void>;
    };
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

  valid: Readable<boolean>;
  empty: Readable<boolean>;
  submitting: Readable<boolean>;
  delayed: Readable<boolean>;
  timeout: Readable<boolean>;

  fields: Record<keyof S, FormField<T>>;
  firstError: Readable<{ path: string[]; message: string } | null>;
  allErrors: Readable<{ path: string[]; message: string }[]>;


  options: FormOptions<T, M>;

  enhance: (el: HTMLFormElement, {
    onSubmit, onResult, onError, onUpdate, onUpdated
  }) => ReturnType<typeof $app/forms/enhance>;

  reset: (options?: { keepMessage: boolean }) => void;

  capture: () => SuperFormSnapshot<T, M>;
  restore: (snapshot: SuperFormSnapshot<T, M>) => void;
};

FormField<S, Prop extends keyof S> = {
  readonly name: Prop;
  value: Writable<S[Prop]>;
  errors?: Writable<ValidationErrors<S[Prop]>>;
  constraints?: Writable<InputConstraints<S[Prop]>>;
  readonly type?: string;
};
```

## Proxy objects

### intProxy(form, fieldName)

Creates a proxy store for an integer schema field. Changes in either the proxy store or the form field will reflect in the other.

### numberProxy(form, fieldName)

Creates a proxy store for a numeric form field.

### booleanProxy(form, fieldName, options?)

**Options:**

```ts
{
  trueStringValue = 'true';
}
```

Creates a proxy store for a boolean schema field. The option can be used to change what string value represents `true`.

### dateProxy(form, fieldName, options?)

Creates a proxy store for a Date schema field. The option can be used to change the proxied format of the date.

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
    | 'iso' = 'iso'
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

A date proxy can be used like this:

```svelte
<script lang="ts">
  import { superForm, dateProxy } from 'sveltekit-superforms/client'
  import type { PageData } from './$types';

  export let data: PageData;

  const form = superForm(data.form)
  const date = dateProxy(form, 'date', { format: 'date' ))
</script>

<input name="date" type="date" bind:value={$date} />
```

## Components

```ts
import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
```

### SuperDebug

`SuperDebug` is a debugging component that gives you colorized and nicely formatted output for any data structure, usually `$form`.

```svelte
<SuperDebug
  data={any}
  display?={true}
  label?={''}
  promise?={false}
  status?={true}
  stringTruncate?={120}
  ref?={HTMLPreElement} />
```

#### Props

| Prop               | Type           | Default value | Description                                                                                                                                       |
| ------------------ | -------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **data**           | any            | `undefined`   | Data to be displayed by SuperDebug                                                                                                                |
| **display**        | Boolean        | `true`        | Whether to show or hide SuperDebug                                                                                                                |
| **label**          | String         | `""`          | Add useful label to SuperDebug, useful when using multiple instances of SuperDebug in a page                                                      |
| **promise**        | Boolean        | `false`       | When true, SuperDebug uses svelte's await block to load the data. Data is assumed to be async but can also load non-async data using await block! |
| **status**         | Boolean        | `true`        | Whether to show or hide status code.                                                                                                              |
| **stringTruncate** | Number         | `120`         | Truncate long string in output.                                                                                                                   |
| **ref**            | HTMLPreElement | `undefined`   | Binds pre tag to ref.                                                                                                                             |

#### Usage

Please see the `+page.svelte` file in [src/routes/super-debug](https://github.com/ciscoheat/sveltekit-superforms/tree/main/src/routes/super-debug) on common usage of SuperDebug.
