<script>
    import { onMount } from "svelte";
    import {
        getCompetitions,
        getFeaturedWinner,
        getPublicStats,
    } from "$lib/api.js";
    import CompetitionCard from "$lib/components/CompetitionCard.svelte";
    import SecondaryButton from "$lib/components/SecondaryButton.svelte";
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import FeaturedWinner from "$lib/components/FeaturedWinner.svelte";
    import StatCard from "$lib/components/StatCard.svelte";
    import Testimonials from "$lib/components/Testimonials.svelte";
    import { Users, Trophy, Camera } from "lucide-svelte";

    let activeCompetitions = [];
    let featuredData = null;
    let loading = true;

    // Live stats from database
    let stats = {
        photographers: 0,
        competitions: 0,
        photos: 0,
    };

    onMount(async () => {
        try {
            // Load all data in parallel
            const [competitions, winnerData, statsData] = await Promise.all([
                getCompetitions("active"),
                getFeaturedWinner(),
                getPublicStats(),
            ]);
            activeCompetitions = competitions;
            featuredData = winnerData;
            stats = statsData;
        } catch (error) {
            console.error("Error loading homepage data:", error);
        } finally {
            loading = false;
        }
    });
</script>

<svelte:head>
    <title>PhotoComp - Community Platform für Zürcher Fotografen</title>
</svelte:head>

<!-- Hero Section with Background Image -->
<section class="hero">
    <div class="hero-background">
        <img src="/hero-zurich.png" alt="Zürich Panorama" class="hero-image" />
        <div class="hero-overlay"></div>
    </div>

    <div class="container">
        <div class="hero-content">
            <h1>Willkommen bei PhotoComp</h1>
            <p class="hero-subtitle">
                Die Community-Plattform für Zürcher Fotografen. Nimm an
                spannenden Wettbewerben teil, erhalte echtes Feedback und
                vernetze dich mit Gleichgesinnten.
            </p>

            <div class="hero-actions">
                <PrimaryButton href="/competitions">
                    Wettbewerbe entdecken
                </PrimaryButton>
                <SecondaryButton href="/submit">
                    Foto einreichen
                </SecondaryButton>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="stats-section">
    <div class="container">
        <div class="stats-grid">
            <StatCard
                icon={Users}
                value="{stats.photographers.toLocaleString('de-CH')}+"
                label="Fotografen"
            />
            <StatCard
                icon={Trophy}
                value="{stats.competitions}+"
                label="Wettbewerbe"
            />
            <StatCard
                icon={Camera}
                value="{stats.photos.toLocaleString('de-CH')}+"
                label="Fotos"
            />
        </div>
    </div>
</section>

<!-- Featured Winners Section -->
{#if !loading && featuredData?.winners}
    <FeaturedWinner data={featuredData} />
{/if}

<!-- Competitions Section with Countdown -->
{#if !loading && activeCompetitions.length > 0}
    <section class="competitions-section">
        <div class="container">
            <div class="section-header">
                <h2>Aktuelle Wettbewerbe</h2>
                <p class="section-subtitle">
                    Zeige dein Können und gewinne tolle Preise
                </p>
            </div>

            <div class="competitions-grid">
                {#each activeCompetitions.slice(0, 3) as competition}
                    <CompetitionCard {competition} />
                {/each}
            </div>

            {#if activeCompetitions.length > 3}
                <div class="view-more">
                    <SecondaryButton href="/competitions">
                        Alle Wettbewerbe anzeigen
                    </SecondaryButton>
                </div>
            {/if}
        </div>
    </section>
{/if}

<!-- Testimonials -->
<Testimonials />

<!-- Sponsors Section -->
<section class="sponsors">
    <div class="container">
        <h3>Unsere Partner</h3>

        <div class="sponsors-grid">
            <div class="sponsor-logo">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <rect width="60" height="60" rx="12" fill="#e5e7eb" />
                </svg>
            </div>
            <div class="sponsor-logo">
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                    <rect width="120" height="40" rx="8" fill="#e5e7eb" />
                </svg>
            </div>
            <div class="sponsor-logo">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <rect width="60" height="60" rx="12" fill="#e5e7eb" />
                </svg>
            </div>
            <div class="sponsor-logo">
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                    <rect width="120" height="40" rx="8" fill="#e5e7eb" />
                </svg>
            </div>
            <div class="sponsor-logo">
                <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
                    <rect width="80" height="50" rx="10" fill="#e5e7eb" />
                </svg>
            </div>
        </div>
    </div>
</section>

<style>
    /* Stats Section */
    .stats-section {
        padding: var(--spacing-3xl) 0;
        background: white;
        border-bottom: 1px solid var(--color-border);
    }

    .stats-section .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-xl);
        max-width: 900px;
        margin: 0 auto;
    }

    /* Hero Section with Background */
    .hero {
        position: relative;
        min-height: 95vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .hero-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center bottom;
    }

   .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 0.5),
        rgb(255, 255, 255, 0)   
    );
}

    .hero .container {
        position: relative;
        z-index: 1;
    }

    .hero-content {
        max-width: 720px;
        margin: 0 auto;
        text-align: center;
        padding: var(--spacing-4xl) 0;
        transform: translateY(-20vh);
    }

    .hero h1 {
        font-size: 3.5rem;
        font-weight: 700;
        margin-bottom: var(--spacing-lg);
        letter-spacing: -0.03em;
        color: (--color-text-primary);
        line-height: 1.1;
    }

    .hero-subtitle {
        font-size: 1.25rem;
        line-height: 1.7;
        margin-bottom: var(--spacing-2xl);
        color: (--color-text-secondary);
        font-weight: 400;
        max-width: 640px;
        margin-left: auto;
        margin-right: auto;
    }

    .hero-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        flex-wrap: wrap;
    }

    /* Competitions Section */
    .competitions-section {
        padding: var(--spacing-4xl) 0;
        background: white;
    }

    .section-header {
        text-align: center;
        margin-bottom: var(--spacing-3xl);
    }

    .section-header h2 {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: var(--spacing-sm);
        color: var(--color-text-primary);
    }

    .section-subtitle {
        font-size: 1.125rem;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .competitions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: var(--spacing-2xl);
        margin-bottom: var(--spacing-2xl);
    }

    .view-more {
        text-align: center;
        margin-top: var(--spacing-3xl);
    }

    /* Sponsors Section */
    .sponsors {
        padding: var(--spacing-4xl) 0;
        background: white;
        border-top: 1px solid var(--color-border);
    }

    .sponsors h3 {
        text-align: center;
        font-size: 1rem;
        font-weight: 500;
        color: var(--color-text-muted);
        margin-bottom: var(--spacing-2xl);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .sponsors-grid {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--spacing-3xl);
        flex-wrap: wrap;
    }

    .sponsor-logo {
        opacity: 0.5;
        transition: opacity 0.2s;
    }

    .sponsor-logo:hover {
        opacity: 0.8;
    }

    /* Mobile Optimizations */
    @media (max-width: 768px) {
        .hero {
            min-height: 100vh;
        }

        .hero-content {
            padding: var(--spacing-3xl) 0;
        }

        .hero h1 {
            font-size: 2.25rem;
        }

        .hero-subtitle {
            font-size: 1rem;
        }

        .hero-actions {
            flex-direction: column;
            width: 100%;
        }

        .competitions-section {
            padding: var(--spacing-3xl) 0;
        }

        .section-header h2 {
            font-size: 1.75rem;
        }

        .competitions-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-xl);
        }

        .sponsors {
            padding: var(--spacing-3xl) 0;
        }

        .sponsors-grid {
            gap: var(--spacing-xl);
        }

        .sponsor-logo svg {
            max-width: 80px;
            height: auto;
        }

        .stats-section .stats-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 480px) {
        .hero h1 {
            font-size: 1.875rem;
        }
    }
</style>
