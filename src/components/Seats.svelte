<script lang="ts">
  export let remaining: number;
  $: plural = remaining !== 1 ? 's' : '';
  $: tense = remaining !== 1 ? '' : 's';
</script>
{#if remaining > 0}
  <div class="pill"><strong>{remaining}</strong> spot{plural} remain{tense}</div>
{:else if remaining === 0}
  <div class="pill"><strong>Game is full!</strong></div>
{:else}
  <div class="pill"><strong>Game cancelled</strong></div>
{/if}
<style>
    .pill {
        padding: 0.25rem 1rem;
        border-top-right-radius: 0.5rem;
        background-color: #0c4a6e;
        display: inline-block;
    }

    @media (min-width: 640px) {
        .pill {
            border-bottom-left-radius: 0.5rem;
        }
    }
</style>