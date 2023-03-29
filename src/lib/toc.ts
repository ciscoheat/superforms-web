import { getContext, hasContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

const store = writable(true);
const id = 'ToC';

export function initToC() {
	if (!hasContext(id)) setContext(id, store);
	return store;
}

export function displayToC(display: boolean) {
	(getContext(id) as Writable<boolean>).set(display);
}
