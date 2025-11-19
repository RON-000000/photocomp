<script>
    import {
        getCompletedCompetitions,
        getLeaderboard,
    } from "$lib/data/mockData";
    import CompetitionCard from "$lib/components/CompetitionCard.svelte";

    $: completedCompetitions = getCompletedCompetitions();
</script>

<svelte:head>
    <title>Archiv - PhotoZürich</title>
</svelte:head>

<div class="container">
    <div class="page-header">
        <h1>🏛️ Archiv</h1>
        <p>Entdecke vergangene Wettbewerbe und ihre Gewinner.</p>
    </div>

    {#if completedCompetitions.length > 0}
        <div class="competitions-list">
            {#each completedCompetitions as competition}
                <div class="competition-archive">
                    <div class="competition-overview">
                        <CompetitionCard {competition} />
                    </div>

                    {#if competition.winners}
                        <div class="winners-section">
                            <h3>🏆 Gewinner</h3>

                            {#each [competition] as comp}
                                {@const leaderboard = getLeaderboard(comp.id)}
                                {@const winner1 = leaderboard.find(
                                    (s) => s.id === comp.winners.first,
                                )}
                                {@const winner2 = leaderboard.find(
                                    (s) => s.id === comp.winners.second,
                                )}
                                {@const winner3 = leaderboard.find(
                                    (s) => s.id === comp.winners.third,
                                )}

                                <div class="podium">
                                    <!-- 2nd Place -->
                                    {#if winner2}
                                        <div class="podium-item second">
                                            <div class="rank">🥈</div>
                                            <img
                                                src={winner2.imageUrl}
                                                alt={winner2.title}
                                            />
                                            <div class="winner-info">
                                                <p class="winner-title">
                                                    {winner2.title}
                                                </p>
                                                <a
                                                    href="/profile/{winner2.user
                                                        .username}"
                                                    class="winner-name"
                                                >
                                                    @{winner2.user.username}
                                                </a>
                                                <p class="winner-score">
                                                    {winner2.totalScore.toFixed(
                                                        2,
                                                    )} Punkte
                                                </p>
                                            </div>
                                        </div>
                                    {/if}

                                    <!-- 1st Place -->
                                    {#if winner1}
                                        <div class="podium-item first">
                                            <div class="rank">🥇</div>
                                            <img
                                                src={winner1.imageUrl}
                                                alt={winner1.title}
                                            />
                                            <div class="winner-info">
                                                <p class="winner-title">
                                                    {winner1.title}
                                                </p>
                                                <a
                                                    href="/profile/{winner1.user
                                                        .username}"
                                                    class="winner-name"
                                                >
                                                    @{winner1.user.username}
                                                </a>
                                                <p class="winner-score">
                                                    {winner1.totalScore.toFixed(
                                                        2,
                                                    )} Punkte
                                                </p>
                                            </div>
                                        </div>
                                    {/if}

                                    <!-- 3rd Place -->
                                    {#if winner3}
                                        <div class="podium-item third">
                                            <div class="rank">🥉</div>
                                            <img
                                                src={winner3.imageUrl}
                                                alt={winner3.title}
                                            />
                                            <div class="winner-info">
                                                <p class="winner-title">
                                                    {winner3.title}
                                                </p>
                                                <a
                                                    href="/profile/{winner3.user
                                                        .username}"
                                                    class="winner-name"
                                                >
                                                    @{winner3.user.username}
                                                </a>
                                                <p class="winner-score">
                                                    {winner3.totalScore.toFixed(
                                                        2,
                                                    )} Punkte
                                                </p>
                                            </div>
                                        </div>
                                    {/if}
                                </div>

                                <a
                                    href="/competitions/{comp.id}"
                                    class="btn btn-secondary btn-sm"
                                >
                                    Alle Submissions anzeigen →
                                </a>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {:else}
        <div class="empty-state">
            <p>Noch keine abgeschlossenen Wettbewerbe im Archiv.</p>
            <a href="/competitions" class="btn btn-primary"
                >Aktuelle Wettbewerbe</a
            >
        </div>
    {/if}
</div>

<style>
    .page-header {
        text-align: center;
        margin-bottom: var(--spacing-3xl);
    }

    .page-header p {
        font-size: 1.125rem;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .competitions-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3xl);
    }

    .competition-archive {
        background: white;
        border-radius: var(--radius-xl);
        padding: var(--spacing-xl);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--color-border);
    }

    .competition-overview {
        margin-bottom: var(--spacing-2xl);
    }

    .winners-section {
        text-align: center;
    }

    .winners-section h3 {
        margin-bottom: var(--spacing-xl);
    }

    .podium {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: var(--spacing-lg);
        align-items: end;
        margin-bottom: var(--spacing-xl);
    }

    .podium-item {
        background: white;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        border: 2px solid var(--color-border);
        transition: all 0.3s;
    }

    .podium-item:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }

    .podium-item.first {
        border-color: #fbbf24;
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
        order: 2;
    }

    .podium-item.second {
        border-color: #9ca3af;
        order: 1;
    }

    .podium-item.third {
        border-color: #cd7f32;
        order: 3;
    }

    .podium-item .rank {
        font-size: 3rem;
        padding: var(--spacing-md);
        background: var(--color-surface);
    }

    .podium-item.first .rank {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    }

    .podium-item img {
        width: 100%;
        height: 250px;
        object-fit: cover;
    }

    .winner-info {
        padding: var(--spacing-lg);
    }

    .winner-title {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: var(--spacing-xs);
        color: var(--color-text-primary);
    }

    .winner-name {
        display: block;
        font-size: 0.875rem;
        color: var(--color-primary);
        margin-bottom: var(--spacing-xs);
    }

    .winner-score {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-3xl);
        background: var(--color-surface);
        border-radius: var(--radius-lg);
    }

    .empty-state p {
        margin-bottom: var(--spacing-xl);
        color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
        .podium {
            grid-template-columns: 1fr;
        }

        .podium-item.first,
        .podium-item.second,
        .podium-item.third {
            order: 0;
        }
    }
</style>
