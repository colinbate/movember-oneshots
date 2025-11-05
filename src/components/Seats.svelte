<script lang="ts">
    let { remaining, ispast }: { remaining: number; ispast: boolean } =
        $props();
    let plural = $derived(remaining !== 1 ? "s" : "");
    let tense = $derived(remaining !== 1 ? "" : "s");
</script>

{#if remaining < 0}
    <div class="pill"><strong>Game cancelled</strong></div>
{:else if ispast}
    <div class="pill"><strong>Game is over</strong></div>
{:else if remaining > 0}
    <div class="pill">
        <strong>{remaining}</strong> spot{plural} remain{tense}
    </div>
{:else}
    <div class="pill"><strong>Game is full!</strong></div>
{/if}

<style>
    .pill {
        padding: 0.25rem 1rem;
        border-radius: 500rem;
        background-color: #fff;
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        line-height: 1;
    }
</style>
