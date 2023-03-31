export function clickOutside(
  node: HTMLElement,
  options: { event: (e: MouseEvent) => void; ignore?: string }
) {
  window.addEventListener('click', handleClick);

  function handleClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement && !node.contains(e.target)) {
      if (options.ignore) {
        for (const el of document.querySelectorAll(options.ignore)) {
          if (el.contains(e.target)) return;
        }
      }
      options.event(e);
    }
  }

  return {
    destroy() {
      window.removeEventListener('click', handleClick);
    }
  };
}
