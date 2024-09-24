<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Date from "./Date.svelte";
  import Seats from "./Seats.svelte";
  import type { ISession } from './sessions';
  import { fly } from "svelte/transition";
  import { focusFirst } from './focus';

  export let session: ISession;
  export let index: number;

  const dispatch = createEventDispatcher();

  let showForm = false;
  let name = '';
  let emsg = '';

  function cancel() {
    showForm = false;
    name = '';
    emsg = '';
  }
  function ok(ev: SubmitEvent) {
    ev.preventDefault();
    if (!name) return;
    emsg = '';
    dispatch('signup', { session, name, setError(msg: string) {
      emsg = msg;
      if (!msg) cancel();
    } });
  }
</script>
<article class:alt={index % 2 === 1}>
  <h3>Game {index + 1}</h3>
  <Date date={session.when} />
  <Seats remaining={session.open_seats} />
  {#if session.open_seats > 0}
  <button type="button" class="signupbtn" on:click={() => {showForm = !showForm}}>I'm interested</button>
    {#if showForm}
    <form on:submit={ok} transition:fly={{y:'30%'}} use:focusFirst>
      <div>
        <input type="text" name="name" autocomplete="name" placeholder="Name" bind:value={name}>
        {#if emsg}<span class="emsg">{emsg}</span>{/if}
      </div>
      <button type="submit" class="subbtn" aria-label="Submit" disabled={!name}>
        <svg viewBox="0 0 20 20" fill="currentColor" class="size-5">
          <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
        </svg>
      </button>
      <button type="button" class="nopebtn" aria-label="Cancel" on:click={cancel}>
        <svg viewBox="0 0 20 20" fill="currentColor" class="size-5">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </form>
    {/if}
  {/if}
</article>

<style>
  .size-5 {
    width: 20px;
    height: 20px;
  }
article {
    margin: 0.5rem -1rem;
    background-color: #18181B;
    position: relative;
}

h3 {
    padding: 1rem;
}

article > :global(p) {
    padding: 0 1rem 1rem;
}

article :global(time) {
    margin: 0 1rem 1rem;
}

.emsg {
  color: crimson;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  translate: 0 -50%;
  font-size: 0.75rem;
}

.signupbtn {
  background-color: #5b0f8a;
  color: #fff;
  border: 0;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  position: relative;
  top: -0.25rem;
  cursor: pointer;
  margin-left: 0.5rem;
}
.signupbtn:hover {
  background-color: #7d27b3;
}

.alt {
    background-color: #27272a;
}

form {
  display: inline-flex;
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  padding: 1rem;
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: blur(7px);
  backdrop-filter: blur(7px);
  align-items: center;
  gap: 0.5rem;
  width: 90%;
  box-sizing: border-box;
}
div {
  flex-grow: 1;
  border: 0;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  position: relative;
}
input {
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  background-color: rgba(255,255,255,0.05);
  color: #fff;
  padding: 0.5rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: Recursive, sans-serif;
}
input::placeholder {
  color: #aaa;
}

form > button {
  border: 0;
  background-color: rgba(255,255,255,0.2);
  border-radius: 9999px;
  padding: 0.5rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

form > button:disabled {
  color: #000;
}

form > button:hover {
  background-color: rgba(255,255,255,0.4);
}

@media (min-width: 640px) {
    article {
        border-radius: 0.5rem;
    }

    h3 {
        border-bottom: 1px solid #000;
    }

    form {
      width: 450px;
    }
}
</style>