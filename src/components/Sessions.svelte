<script lang="ts">
  import { onMount } from "svelte";
  import Date from "./Date.svelte";
  import Seats from "./Seats.svelte";

type ISession = {
  id: string;
  when: string;
  open_seats: number;
};
let sessions: ISession[] = [];

export let gameId;

const URL = `${import.meta.env.PUBLIC_MOVEMBERAPI}/api/collections/game_session/records?sort=when&filter=game%3D%27${gameId}%27&fields=when,open_seats`;

onMount(async () => {
  const res = await fetch(URL);
  const data = await res.json();
  sessions = data.items as ISession[];
});

</script>
<section>
  {#each sessions as session, i}
  <div class:alt={i % 2 === 1}>
    <h3>Game {i+1}</h3>
    <Date date={session.when} />
    <Seats remaining={session.open_seats} />
  </div>
  {/each}
</section>

<style>
div {
    margin: 0.5rem -1rem;
    background-color: #18181B;
}

div > h3 {
    padding: 1rem;
}

div > :global(p) {
    padding: 0 1rem 1rem;
}

div :global(time) {
    margin: 0 1rem 1rem;
}

.alt {
    background-color: #27272a;
}

@media (min-width: 640px) {
    div {
        border-radius: 0.5rem;
    }

    div > h3 {
        border-bottom: 1px solid #000;
    }
}
</style>