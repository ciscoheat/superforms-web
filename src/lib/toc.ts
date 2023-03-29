import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export function initToC(display = true) {
	const store = writable(display);
	setContext('ToC', store);
	return store;
}

export function displayToC(display: boolean) {
	(getContext('ToC') as Writable<boolean>).set(display);
}
