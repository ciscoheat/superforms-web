<script lang="ts">
  import logo from '$lib/assets/logo.svg';
  import confetti from 'canvas-confetti';
  import { onMount, tick } from 'svelte';

  onMount(async () => {
    if (!localStorage.getItem('1.0 release')) {
      localStorage.setItem('1.0 release', 'true');
      await tick();
      confetti({
        particleCount: 75,
        spread: 180,
        ticks: 200,
        origin: { y: 0.25 },
        colors: ['#edce0f', '#edce0f', '#E81224', '#efd210', '#7f8be6']
      });
    }
  });
</script>

<div class="flex flex-col items-center pb-4">
  <img src={logo} class="mt-1" width="130px" alt="Superforms logo" />
  <h1 class="mb-4">Superforms 💥</h1>
  <h4 class="mt-0">🏆 Svelte Hack 2023 winner - Best library! 🏆</h4>
</div>
