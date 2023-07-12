<script lang="ts">
  import { page } from '$app/stores';
</script>

<div>
  <h1>{$page.status}</h1>
  <h3>💥 {$page.error?.message} 💥</h3>
</div>

<style>
  div {
    height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
