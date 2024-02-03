import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';
import { persisted } from 'svelte-persisted-store';
import { writable, type Writable } from 'svelte/store';

type Settings = {lib: string, pm: string}

const key = 'superforms'

const defaults = {
  lib: '',
  pm: 'npm i -D'
} satisfies Settings

export function getSettings() {
  if(!browser) return writable(defaults);

  if (!getContext(key)) {
    setContext(
      key,
      persisted(key, defaults)
    );
  }

  return getContext(key) as Writable<Settings>
}
