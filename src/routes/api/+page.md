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

```ts
/**
 * HTML input constraints returned from superValidate
 */
InputConstraints = Partial<{
  pattern: string;
  min: number | string;
  max: number | string;
  required: boolean;
  step: number;
  minlength: number;
  maxlength: number;
}>;
```

```ts
/**
 * The return value from superValidate
 */
Validation<T, M = any> = {
  valid: boolean;
  data: S;
  errors: Nested<S, string[] | undefined>;
  empty: boolean;
  constraints: Nested<S, InputConstraints | undefined>;
  message?: M;
  id?: string;
  meta?: { types: Nested<S, string> }
};
```

## Server API

```ts
import {
  superValidate,
  setError,
  message,
  noErrors,
  actionResult
} from 'sveltekit-superforms/server';
```

### superValidate(data, schema, options?)

```ts
superValidate<T extends AnyZodObject, M = any>(
  data:
    | RequestEvent
    | Request
    | FormData
    | URL
    | URLSearchParams
    | Partial<S>
    | null
    | undefined,
  schema: T | ZodEffects<T>, // refine/superRefine/transform
  options?: {
    noErrors = false;    // Remove errors from output (but preserves valid status)
    includeMeta = false; // Add metadata to the validation entity
    id?: string          // Form id, for multiple forms support
  }
): Promise<Validation<T, M>>
```

If `data` is determined to be empty (`null`, `undefined` or no `FormData`), a validation with a default entity for the schema is returned, in this shape:

```js
{
  valid: false;
  errors: {};
  data: S;
  empty: true;
  constraints: Nested<S, InputConstraints>;
  id?: undefined;
  message?: undefined;
  meta?: { types: Record<keyof S, string> }
}
```

See [this FAQ entry](https://github.com/ciscoheat/sveltekit-superforms/wiki/Default-entity-values) for a list of default entity values.

### setError(form, field, error, options?)

```ts
setError(
  form: Validation<T, M>,
  field: keyof S | [keyof S, ...(string | number)[]] | [] | null,
  error: string | string[],
  options?: { overwrite = false, status = 400 }
) : ActionFailure<{form: Validation<T>}>
```

If you want to set an error on the form after validation, use `setError`. It returns a `fail(status, { form })` so it can be returned immediately, or more errors can be added by calling it multiple times before returning. Use the `overwrite` option to remove all previously set errors for the field, and `status` to set a different status than the default `400`.

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

### noErrors(form)

If you want to return a form with no validation errors. Only the `errors` property will be modified, so `valid` still indicates the validation status. Can be useful for load functions where the entity is invalid, but as an initial state no errors should be displayed on the form.

```ts
noErrors(form: Validation<T, M>) : Validation<T, M>
```

### actionResult(type, data?, status?)

When using [endpoints](https://kit.svelte.dev/docs/routing#server) instead of form actions, you must return an `ActionResult`, `throw redirect(...)` won't work directly since `superForms` expects an `ActionResult`. This method helps you construct one in a `Response` object, so you can return a validation object from your API/endpoints.

```ts
// Every call can take a http status as a third parameter.
actionResult('success', { form });
actionResult('failure', { form });
actionResult('redirect', '/');
actionResult('error', 'Error message');
```

Example for a login request:

**src/routes/login/+server.ts**

```ts
import { actionResult, superValidate } from '$lib/server';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5)
});

export const POST = (async (event) => {
  const form = await superValidate(event, loginSchema);
  if (!form.valid) return actionResult('failure', { form });

  // Verify login here //

  return actionResult('success', { form });
}) satisfies RequestHandler;
```

## Client API

```ts
import {
  superForm,
  intProxy,
  numberProxy,
  booleanProxy,
  dateProxy
} from 'sveltekit-superforms/client';
```

### superForm(form, options?)

```ts
superForm<T, M = any>(
  form: Validation<T, M> | null | undefined,
  options?: FormOptions<T, M>
) : EnhancedForm<T, M>
```

```ts
FormOptions<T extends AnyZodObject, M> = Partial<{
  id: string;
  applyAction: boolean;
  invalidateAll: boolean;

  resetForm: boolean;
  scrollToError: 'auto' | 'smooth' | 'off';
  autoFocusOnError: boolean | 'detect';
  errorSelector: string;
  selectErrorText: boolean;
  stickyNavbar: string;

  taintedMessage: string | false | null;
  dataType: 'form' | 'json';
  validators: Validators<T> | T;
  defaultValidator: 'keep' | 'clear';
  clearOnSubmit: 'errors' | 'message' | 'errors-and-message' | 'none';

  delayMs: number;
  timeoutMs: number;
  multipleSubmits: 'prevent' | 'allow' | 'abort';

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
    cancel: () => void;
  }) => MaybePromise<unknown | void>;
  onUpdated: (event: {
    form: Validation<T, M>;
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
  };
}>;
```

### superForm return type

```ts
EnhancedForm<T extends AnyZodObject, M = any> = {
  form: Writable<S>;
  formId: Writable<string | undefined>;
  errors: Writable<Nested<S, string[] | undefined>>;
  constraints: Writable<Nested<S, InputConstraints | undefined>>;
  message: Writable<M>;
  meta: Readable<{ types: Record<keyof S, string> | undefined }>;

  valid: Readable<boolean>;
  empty: Readable<boolean>;
  submitting: Readable<boolean>;
  delayed: Readable<boolean>;
  timeout: Readable<boolean>;

  fields: Record<keyof S, FormField<T>>;
  firstError: Readable<{ path: string[]; message: string } | null>;
  allErrors: Readable<{ path: string[]; message: string }[]>;

  tainted: Readable<Nested<S, true | undefined> | undefined>;

  enhance: (el: HTMLFormElement, {
    onSubmit, onResult, onError, onUpdate, onUpdated
  }) => ReturnType<typeof $app/forms/enhance>;

  update: FormUpdate;
  reset: (options?: { keepMessage: boolean }) => void;

  capture: () => SuperFormSnapshot<T, M>;
  restore: (snapshot: SuperFormSnapshot<T, M>) => void;
};

FormUpdate = (
  result: Exclude<ActionResult, { type: 'error' }>,
  untaint?: boolean
) => Promise<void>;

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

## Example

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
