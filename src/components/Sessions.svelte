<script lang="ts">
  import { onMount } from "svelte";
  import type { ISession } from './sessions';
  import Session from "./Session.svelte";


let sessions: ISession[] = [];
let empty = 'Loading games...';
export let gameId;

const LIST_URL = `${import.meta.env.PUBLIC_MOVEMBERAPI}/api/collections/game_session/records?sort=when&filter=game%3D%27${gameId}%27&fields=id,when,open_seats`;
const SIGNUP_URL = `${import.meta.env.PUBLIC_MOVEMBERAPI}/player/add`;

onMount(async () => {
  try {
    const res = await fetch(LIST_URL);
    const data = await res.json();
    sessions = data.items as ISession[];
  } catch (e) {
    empty = 'Could not access game info.';
  }
});

async function signup(ev: CustomEvent<{session: ISession, name: string, setError: (msg: string) => void}>) {
  const { session, name, setError } = ev.detail;
  try {
    const res = await fetch(SIGNUP_URL, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({session: session.id, name}),
    });
    const data = await res.text();
    if (res.status !== 200) {
      setError(data);
    } else {
      setError('');
    }
  } catch (e) {
    setError(e.message || 'Failed to save.');
  }
}
</script>
<section>
  {#each sessions as session, i}
    <Session {session} index={i} on:signup={signup} />
  {:else}
    <p class="empty">{empty}</p>
  {/each}
</section>

<style>
.empty {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  font-size: 1.5rem;
}
</style>