<script lang="ts">
    import { onMount } from "svelte";

    type Props = {
      eventSlug: string;
    };

    const { eventSlug } = $props();

    type ChronosSession = {
        startsAt: string;
        durationMinutes: number;
        status: string;
    };

    type ChronosResponse = {
        title: string;
        status: string;
        timezone: string;
        signupUrl: string;
        signup: {
            accepting: boolean;
            opensAt: string | null;
            closesAt: string | null;
        };
        sessions: ChronosSession[];
    };

    const API_URL = import.meta.env.PUBLIC_CHRONOS_API_URL;

    let event = $state.raw<ChronosResponse | null>(null);
    let errorMessage = $state("");
    let loading = $state(true);

    let confirmedSessions = $derived.by(() =>
        event
            ? event.sessions
                  .slice()
                  .sort(
                      (left, right) =>
                          new Date(left.startsAt).getTime() -
                          new Date(right.startsAt).getTime(),
                  )
            : [],
    );
    let signupUrl = $derived(
        event ? getPublicUrl(event.signupUrl) : "",
    );
    let signupAvailable = $derived(
        Boolean(event?.signup.accepting && signupUrl),
    );

    function getPublicUrl(value: string) {
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:"
                ? url.href
                : "";
        } catch {
            return "";
        }
    }

    function isChronosResponse(value: unknown): value is ChronosResponse {
        if (!value || typeof value !== "object") return false;

        const candidate = value as Partial<ChronosResponse>;
        return (
            typeof candidate.title === "string" &&
            typeof candidate.status === "string" &&
            typeof candidate.timezone === "string" &&
            typeof candidate.signupUrl === "string" &&
            Array.isArray(candidate.sessions) &&
            candidate.sessions.every(
                (session) =>
                    typeof session?.startsAt === "string" &&
                    typeof session?.durationMinutes === "number" &&
                    typeof session?.status === "string",
            ) &&
            Boolean(candidate.signup) &&
            typeof candidate.signup?.accepting === "boolean"
        );
    }

    function formatStart(startsAt: string) {
        const date = new Date(startsAt);
        if (Number.isNaN(date.getTime())) return "Date to be announced";

        return new Intl.DateTimeFormat("en", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
        }).format(date);
    }

    function formatDuration(minutes: number) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const parts: string[] = [];

        if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
        if (remainingMinutes) parts.push(`${remainingMinutes} minutes`);

        return parts.join(" ") || "Duration to be announced";
    }

    onMount(() => {
        const controller = new AbortController();

        async function loadEvent() {
            if (!API_URL) {
                errorMessage = "The schedule is not available right now.";
                loading = false;
                return;
            }

            try {
                const response = await fetch(`${API_URL}${eventSlug}`, {
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Chronos returned ${response.status}`);
                }

                const data: unknown = await response.json();
                if (!isChronosResponse(data)) {
                    throw new Error("Chronos returned an unexpected response");
                }

                event = data;
            } catch (error) {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    errorMessage = "The schedule could not be loaded. Please try again later.";
                }
            } finally {
                loading = false;
            }
        }

        void loadEvent();

        return () => controller.abort();
    });
</script>

{#snippet chronosLink(label: string)}
    {#if signupUrl}
        <a class="chronos-link" href={signupUrl} rel="external">
            <img src="/img/chronos.svg" alt="" width="32" height="32" />
            <span>{label}</span>
            <span aria-hidden="true">→</span>
        </a>
    {/if}
{/snippet}

<div class="chronos" aria-live="polite">
    {#if loading}
        <div class="status-card">
            <span class="status-mark" aria-hidden="true"></span>
            <p>Checking Chronos for the latest schedule…</p>
        </div>
    {:else if errorMessage}
        <div class="status-card error" role="status">
            <span class="status-mark" aria-hidden="true">!</span>
            <div>
                <h3>Schedule temporarily unavailable</h3>
                <p>{errorMessage}</p>
            </div>
        </div>
    {:else if event}
        <div class="schedule-grid">
            <div class="schedule-copy">
                {#if confirmedSessions.length > 0}
                    <p class="schedule-intro">
                        The proposed session times are below. Each session runs the
                        same adventure, so you only need to join one. <a href={signupUrl}>Choose which times work for you.</a>
                    </p>
                    <ol class="session-list">
                        {#each confirmedSessions as session, index (session.startsAt)}
                            <li>
                                <span class="session-number">{String(index + 1).padStart(2, "0")}</span>
                                <div>
                                    <time datetime={session.startsAt}>
                                        {formatStart(session.startsAt)}
                                    </time>
                                    <span class="duration">{formatDuration(session.durationMinutes)}</span>
                                </div>
                            </li>
                        {/each}
                    </ol>
                {:else}
                    <div class="interest-copy">
                        <span class="not-yet">Nothing confirmed—yet.</span>
                        <p>
                            This year I'm managing dates in a tool I created called Chronos.
                            <a href={signupUrl}>Choose which times work for you</a>; your availability will help decide which
                            sessions get scheduled. There are a number of options throughout November.
                        </p>
                    </div>
                {/if}
            </div>

            <aside class="signup-card">
                <div class="chronos-brand">
                    <img src="/img/chronos.svg" alt="" width="44" height="44" />
                    <div>
                        <strong>Chronos</strong>
                        <span>Event scheduling</span>
                    </div>
                </div>

                {#if signupAvailable}
                    {#if confirmedSessions.length > 0}
                        <h3>Claim your seat</h3>
                        <p>Open Chronos to choose a session and finish signing up.</p>
                        {@render chronosLink("Sign up with Chronos")}
                    {:else}
                        <h3>Help choose the dates</h3>
                        <p>Share the potential times that suit you. You can update your response later.</p>
                        {@render chronosLink("View possible times")}
                    {/if}
                {:else}
                    <h3>Sign-up is currently closed</h3>
                    <p>Check back here for the next update.</p>
                {/if}
            </aside>
        </div>
    {/if}
</div>

<style>
    .chronos {
        max-width: 68rem;
    }

    .schedule-grid {
        display: grid;
        gap: 2rem;
    }

    .schedule-copy {
        min-width: 0;
    }

    .schedule-intro {
        max-width: 46rem;
        margin-top: 0;
        font-size: clamp(1.1rem, 2vw, 1.35rem);
        font-weight: 700;
        line-height: 1.4;
    }

    .not-yet {
        display: block;
        margin-bottom: 1rem;
        color: var(--rust);
        font-family: "Bowlby One SC", display;
        font-size: clamp(2.35rem, 7vw, 3.2rem);
        line-height: 0.95;
        text-wrap: balance;
    }

    .interest-copy p {
        max-width: 39rem;
        margin-bottom: 0;
        font-size: clamp(1.05rem, 1.7vw, 1.2rem);
    }

    .session-list {
        margin: 1.75rem 0 0;
        padding: 0;
        border-top: var(--line);
        list-style: none;
    }

    .session-list li {
        display: grid;
        grid-template-columns: 3rem minmax(0, 1fr);
        gap: 1rem;
        align-items: center;
        padding: 1rem 0;
        border-bottom: var(--line);
    }

    .session-number {
        color: var(--rust);
        font-family: "Bowlby One SC", display;
        font-size: 1.6rem;
        line-height: 1;
    }

    time,
    .duration {
        display: block;
    }

    time {
        font-size: clamp(1.05rem, 2vw, 1.25rem);
        font-weight: 700;
        line-height: 1.25;
    }

    .duration {
        margin-top: 0.2rem;
        color: var(--slime-dark);
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .signup-card,
    .status-card {
        padding: 1.35rem;
        border: var(--line);
        box-shadow: 6px 6px 0 var(--ink);
    }

    .signup-card {
        align-self: start;
        background: var(--orange);
        transform: rotate(0.5deg);
    }

    .signup-card h3 {
        margin: 1.35rem 0 0.6rem;
    }

    .signup-card p {
        margin: 0 0 1.15rem;
    }

    .chronos-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--ink);
    }

    .chronos-brand img {
        width: 2.75rem;
        height: 2.75rem;
        padding: 0.25rem;
        border: 2px solid var(--ink);
        border-radius: 0.45rem;
        background: var(--paper);
    }

    .chronos-brand strong,
    .chronos-brand span {
        display: block;
        line-height: 1.05;
    }

    .chronos-brand strong {
        font-family: "Bowlby One SC", display;
        font-size: 1.45rem;
        font-weight: 400;
    }

    .chronos-brand span {
        margin-top: 0.2rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .chronos-link {
        display: grid;
        grid-template-columns: 2rem 1fr auto;
        gap: 0.7rem;
        align-items: center;
        width: 100%;
        padding: 0.7rem 0.85rem;
        border: 2px solid var(--ink);
        color: var(--paper);
        background: var(--ink);
        box-shadow: 3px 3px 0 var(--slime);
        line-height: 1.2;
        text-decoration: none;
        cursor: pointer;
    }

    .chronos-link:hover {
        color: var(--ink);
        background: var(--slime);
        box-shadow: 3px 3px 0 var(--ink);
    }

    .chronos-link img {
        width: 2rem;
        height: 2rem;
        padding: 0.25rem;
        border-radius: 0.25rem;
        background: var(--paper);
    }

    .status-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 42rem;
        background: var(--paper);
    }

    .status-card p,
    .status-card h3 {
        margin: 0;
    }

    .status-card h3 + p {
        margin-top: 0.35rem;
    }

    .status-mark {
        flex: 0 0 auto;
        width: 1.5rem;
        height: 1.5rem;
        border: 3px solid var(--ink);
        border-top-color: var(--orange);
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
    }

    .status-card.error .status-mark {
        display: grid;
        place-items: center;
        height: 2rem;
        width: 2rem;
        border-color: var(--ink);
        border-radius: 0;
        background: var(--orange);
        animation: none;
        font-weight: 700;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (min-width: 52rem) {
        .schedule-grid {
            grid-template-columns: minmax(0, 1.3fr) minmax(17rem, 0.7fr);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .status-mark {
            animation: none;
        }
    }
</style>
