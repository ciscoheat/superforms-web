type Example = {
  slug: string,
  tags: string[],
  description: string,
  libs: string[]
}

const exampleData = [
  ['multi-step-client', 'client-validation multi-step events', 'Multi-step form on the client', 'zod'],
  ['multi-step-server', 'multi-step no-js', 'Multi-step form on the server, no JS required', 'zod'],
  ['multi-step-skeleton', 'multi-step skeleton', 'Multi-step form with the Skeleton UI framework', 'valibot'],
  ['components', 'components multiple-forms', 'How to use Superforms in components', 'zod'],
  ['radio-check', 'radio-buttons checkboxes array schema-refine', 'Group inputs, with radio buttons and checkboxes', 'zod'],
  ['multi-select', 'dropdown multiple-options array', 'Group inputs, with a dropdown menu and a multiple select menu', 'zod'],
  ['dropdown-check', 'dropdown checkboxes array', 'Group inputs, with a dropdown menu and checkboxes', 'zod'],
  ['list-actions', 'list spinner form-id database', 'How to use actions (like delete) on a list of data', 'zod'],
  ['username-check', 'debounce database fetch events', 'How to make a debounced "username available" check', 'zod'],
  ['crud', 'backend database crud spinner', 'A fully functional CRUD backend in 150 lines of code', 'zod']
]

export const examples : Example[] = exampleData.map(e => ({
  slug: e[0],
  tags: e[1].split(' '),
  description: e[2],
  libs: e[3].split(' ')
}))