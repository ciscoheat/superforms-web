type Example = {
  slug: string,
  tags: string[],
  description: string,
  libs: string[]
}

// Sort by popularity
const exampleData = [
  ['components', 'components multiple-forms', 'How to use and reuse forms and input fields in components.', 'zod'],
  ['radio-check', 'radio-buttons checkboxes array schema-refine', 'Group inputs, with radio buttons and checkboxes.', 'zod'],
  ['multi-select', 'dropdown multiple-options array', 'Group inputs, with a dropdown menu and a multiple select menu.', 'zod'],
  ['dropdown-check', 'dropdown checkboxes array', 'Group inputs, with a dropdown menu and checkboxes.', 'zod'],
  ['file-uploads', 'file-upload array client-validation', 'Single and multiple file upload with client-side validation.', 'zod'],
  ['date-array', 'components array date proxy', 'Array of components with a proxy for date input.', 'zod'],
  ['list-actions', 'list spinner form-id database', 'How to use Superforms with actions on a list of data.', 'zod'],
  ['spa', 'spa spinner fetch client-validation proxy', 'Single-page application form, no +page.server.ts, calling an external API instead.', 'valibot'],
  ['multi-step-client', 'client-validation multi-step events', 'Multi-step form on the client, JS required but nice UX.', 'zod'],
  ['multi-step-server', 'multi-step no-js', 'Multi-step form on the server, no JS required but reloads on every step.', 'zod'],
  ['multi-step-skeleton', 'multi-step skeleton', 'Multi-step form with the Skeleton UI framework.', 'valibot'],
  ['url', 'url list database', 'Parsing the URL parameters and filtering a list of items.', 'zod'],
  ['username-available', 'debounce database fetch events', 'How to make a debounced "username available" check.', 'zod'],
  ['crud', 'backend database crud spinner', 'A fully functional CRUD backend in 150 lines of code.', 'zod'],
  ['custom-client', 'runes', 'Minimal custom client using Runes, for simple forms.', 'zod']
]

export const examples : Example[] = exampleData.map(e => ({
  slug: e[0].trim(),
  tags: `${e[1]} ${e[3]}`.trim().split(' '),
  description: e[2].trim(),
  libs: e[3].trim().split(' ')
}))

export const tags = Array.from(new Set(examples.flatMap(e => e.tags))).sort()