<script lang="ts">
  import { derived, type Readable } from 'svelte/store';

  export let submitting: Readable<boolean>;
  export let delayed: Readable<boolean>;
  export let timeout: Readable<boolean>;

  export let delayMs = 500;
  export let timeoutMs = 8000;

  let time = derived(
    submitting,
    ($s, set) => {
      let timer: Date | undefined = undefined;
      const interval = setInterval(() => {
        if (!$submitting) timer = undefined;
        else if (!timer) timer = new Date();
        let output = timer ? Date.now() - timer.getTime() + 'ms' : '';
        output = output.padEnd(6);
        set(output);
      }, 1);

      return () => clearInterval(interval);
    },
    '      '
  );
</script>

<pre><span class:green={!$submitting}>Idle</span> → <span
    class:green={$submitting}>submitting</span> → <span class:green={$delayed}
    >delayed</span> → <span class:green={$timeout}>timeout</span>
{$time} <span class:green={$submitting}>0 ms</span>         <span
    class:green={$delayed}>{delayMs} ms</span>    <span class:green={$timeout}
    >{timeoutMs} ms</span>
</pre>

<style lang="scss">
  pre {
    span {
      color: rgb(236, 68, 68);
      &.green {
        color: rgb(55, 200, 55);
      }
    }
    
    width: min-content;
    font-size: 100%;
    @media screen and (max-width: 600px) {
      font-size: 85%;
    }
  }
</style>
