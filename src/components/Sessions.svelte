<script lang="ts">
    import { onMount } from "svelte";
    import type { ISession } from "./sessions";
    import Session from "./Session.svelte";

    let { gameId }: { gameId: string } = $props();
    let sessions: ISession[] = $state([]);
    let empty = $state("Loading games...");

    const LIST_URL = `${import.meta.env.PUBLIC_MOVEMBERAPI}/api/collections/game_session/records?sort=when&filter=game%3D%27${gameId}%27&fields=id,when,open_seats`;
    const SIGNUP_URL = `${import.meta.env.PUBLIC_MOVEMBERAPI}/player/add`;

    onMount(async () => {
        try {
            const res = await fetch(LIST_URL);
            const data = await res.json();
            sessions = data.items as ISession[];
        } catch (e) {
            empty = "Could not access game info.";
        }
    });

    async function signup(
        session: ISession,
        name: string,
        setError: (msg: string) => void,
    ) {
        try {
            const res = await fetch(SIGNUP_URL, {
                method: "POST",
                mode: "cors",
                credentials: "omit",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ session: session.id, name }),
            });
            const data = await res.text();
            if (res.status !== 200) {
                setError(data);
            } else {
                setError("");
            }
        } catch (e) {
            setError(e.message || "Failed to save.");
        }
    }
</script>

<div>
    {#each sessions as session, i}
        <Session {session} index={i} onsignup={signup} />
    {:else}
        <p class="empty">{empty}</p>
    {/each}
</div>

<style>
    .empty {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: rgba(255, 255, 255, 0.2);
        font-size: 1.5rem;
    }
</style>
