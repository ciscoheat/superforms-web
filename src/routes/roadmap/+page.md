# Roadmap to 1.0

<svelte:head><title>Superforms roadmap</title></svelte:head>

With the newly released **v0.7** version, introducing [single page application support](/concepts/spa), a 1.0 version isn't too far away! There is just one more milestone before it happens:

## v0.8 - Immediate client-side validation

Right now with Superforms, you have to submit the form before any validation takes place, even for client-side validators. This isn't optimal UX because you want to provide continuous feedback to the user, both when mistakes are made and corrected.

The [reward early, validate late](https://medium.com/wdstack/inline-validation-in-forms-designing-the-experience-123fb34088ce) pattern is a user-friendly way of providing error feedback. It displays errors as late as possible, on the `blur` event, but removes them on every change, the `input` event.

This would be easy to implement, wouldn't it be for the fact that Superforms knows nothing about the form it's being applied to. The `use:enhance` only does the submit part, and the only DOM access happens when focusing on the first error field, by a simple querySelector lookup.

This is what makes the library simple to use, since it's just about html attributes and Svelte stores, but it seems like this has to change behind the scenes for the immediate validation part.

We cannot just add some events to the input fields though, since they still don't know about their connection to the `$form` store. The solution will probably be to add form-wide events, and diff the `$form` and `$tainted` stores with their previous state, to determine which field has changed.

As usual, everything will be configurable through options.

At the same time, the `$allErrors` store will probably be renamed, since it should now contain all errors, not just the visible ones in `$errors`.

## v1.0

The `update` function will get an upgrade before 1.0, so it can be used to set `$form` data without having to modify the `$tainted` store at the same time, avoiding timing issues.

After this fix and a period of bug fixing, we're ready for official release!

## Feedback

Any questions and thoughts about the roadmap, let me know on [Discord](https://discord.gg/AptebvVuhB) or [Github](https://github.com/ciscoheat/sveltekit-superforms/discussions)!
