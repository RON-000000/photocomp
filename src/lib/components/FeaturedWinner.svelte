<script>
    import { Trophy } from "lucide-svelte";

    export let data = null;

    function formatScore(score) {
        return score?.toFixed(2) || "0.00";
    }

    // Medal colors for ranks
    const rankColors = {
        1: {
            bg: "linear-gradient(135deg, #FFD700, #FFA500)",
            label: "1. Platz",
        },
        2: {
            bg: "linear-gradient(135deg, #C0C0C0, #A8A8A8)",
            label: "2. Platz",
        },
        3: {
            bg: "linear-gradient(135deg, #CD7F32, #B87333)",
            label: "3. Platz",
        },
    };
</script>

{#if data?.winners && data.winners.length > 0}
    <section class="featured-winners">
        <div class="container">
            <div class="section-header">
                <div class="header-icon">
                    <Trophy size={28} />
                </div>
                <div class="header-text">
                    <h2>Top 3 Gewinner</h2>
                    <a
                        href="/competitions/{data.competition._id}"
                        class="competition-link"
                    >
                        {data.competition.title}
                    </a>
                </div>
            </div>

            <div class="winners-grid">
                {#each data.winners as winner}
                    <a
                        href="/submissions/{winner.submission._id}"
                        class="winner-card rank-{winner.rank}"
                    >
                        <div class="winner-image-wrapper">
                            <img
                                src={winner.submission.imageUrl}
                                alt={winner.submission.title}
                                class="winner-image"
                            />
                            <div
                                class="rank-badge"
                                style="background: {rankColors[winner.rank].bg}"
                            >
                                <Trophy size={16} />
                                <span>{rankColors[winner.rank].label}</span>
                            </div>
                        </div>

                        <div class="winner-content">
                            <div class="photographer">
                                <img
                                    src={winner.user?.avatar ||
                                        `https://i.pravatar.cc/150?u=${winner.user?.username}`}
                                    alt={winner.user?.name}
                                    class="photographer-avatar"
                                />
                                <div class="photographer-info">
                                    <span class="photographer-name"
                                        >{winner.user?.name ||
                                            "Unbekannt"}</span
                                    >
                                    <span class="photographer-username"
                                        >@{winner.user?.username ||
                                            "unknown"}</span
                                    >
                                </div>
                            </div>

                            <h3 class="photo-title">
                                {winner.submission.title}
                            </h3>

                            <div class="score-info">
                                <span class="score-label">Score</span>
                                <span class="score-value"
                                    >{formatScore(
                                        winner.submission.totalScore,
                                    )}</span
                                >
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    </section>
{/if}

<style>
    .featured-winners {
        padding: var(--spacing-4xl) 0;
        background: var(--color-surface);
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-3xl);
    }

    .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #ffd700, #ffa500);
        border-radius: var(--radius-lg);
        color: white;
    }

    .header-text h2 {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 var(--spacing-xs) 0;
        color: var(--color-text-primary);
    }

    .competition-link {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-primary);
        text-decoration: none;
    }

    .competition-link:hover {
        text-decoration: underline;
    }

    .winners-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-xl);
        /* Safari grid fixes */
        align-items: start;
    }

    .winner-card {
        display: flex;
        flex-direction: column;
        background: white;
        border-radius: var(--radius-xl);
        overflow: hidden;
        border: 1px solid var(--color-border);
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
        /* Safari fixes - prevent layout recalculation loop */
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        contain: layout;
        min-width: 0;
    }

    .winner-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
    }

    /* First place special styling */
    .winner-card.rank-1 {
        border-color: #ffd700;
        box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.3);
    }

    .winner-card.rank-1:hover {
        border-color: #ffd700;
        box-shadow:
            var(--shadow-xl),
            0 0 20px rgba(255, 215, 0, 0.2);
    }

    .winner-image-wrapper {
        position: relative;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        /* Safari fixes */
        min-height: 0;
        flex-shrink: 0;
    }

    /* Safari aspect-ratio fallback */
    @supports not (aspect-ratio: 4 / 3) {
        .winner-image-wrapper {
            padding-top: 75%; /* 3/4 = 0.75 */
        }

        .winner-image {
            position: absolute;
            top: 0;
            left: 0;
        }
    }

    .winner-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease;
        /* Prevent Safari from resizing */
        flex-shrink: 0;
    }

    .winner-card:hover .winner-image {
        transform: scale(1.05);
    }

    .rank-badge {
        position: absolute;
        top: var(--spacing-md);
        left: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-md);
        color: white;
        font-size: 0.8125rem;
        font-weight: 600;
        box-shadow: var(--shadow-md);
    }

    .winner-content {
        display: flex;
        flex-direction: column;
        padding: var(--spacing-lg);
        flex: 1;
    }

    .photographer {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
    }

    .photographer-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--color-border);
    }

    .photographer-info {
        display: flex;
        flex-direction: column;
    }

    .photographer-name {
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--color-text-primary);
    }

    .photographer-username {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
    }

    .photo-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .score-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--color-border);
    }

    .score-label {
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
    }

    .score-value {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--color-primary);
    }

    /* Mobile Optimization */
    @media (max-width: 1024px) {
        .winners-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
        }

        .winner-card {
            flex-direction: row;
        }

        .winner-image-wrapper {
            width: 200px;
            aspect-ratio: 1;
            flex-shrink: 0;
        }

        .winner-content {
            justify-content: center;
        }
    }

    @media (max-width: 768px) {
        .featured-winners {
            padding: var(--spacing-3xl) 0;
        }

        .section-header {
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-2xl);
        }

        .header-icon {
            width: 48px;
            height: 48px;
        }

        .header-text h2 {
            font-size: 1.5rem;
        }

        .winner-card {
            flex-direction: column;
        }

        .winner-image-wrapper {
            width: 100%;
            aspect-ratio: 16 / 9;
        }
    }
</style>
