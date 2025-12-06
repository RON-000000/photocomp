<script>
    import { Camera, Users, Award, Heart } from "lucide-svelte";
</script>

<svelte:head>
    <title>Über PhotoComp - Unsere Mission</title>
    <meta
        name="description"
        content="Erfahre mehr über PhotoComp, unsere Mission und wie wir Fotografen verbinden."
    />
</svelte:head>

<div class="about-page">
    <div class="hero">
        <div class="container">
            <h1>Über PhotoComp</h1>
            <p class="lead">
                Wir verbinden Fotografie-Enthusiasten durch faire Wettbewerbe
                und eine inspirierende Community.
            </p>
        </div>
    </div>

    <div class="container content">
        <section class="mission-section">
            <div class="grid grid-2">
                <div class="text-content">
                    <h2>Unsere Mission</h2>
                    <p>
                        PhotoComp wurde mit einem einfachen Ziel gegründet: Eine
                        Plattform zu schaffen, auf der das Bild im Mittelpunkt
                        steht. Keine Algorithmen, die Clickbait belohnen,
                        sondern echte Wertschätzung für handwerkliches Können
                        und kreative Visionen.
                    </p>
                    <p>
                        Wir glauben daran, dass Wettbewerb inspirieren sollte,
                        nicht entmutigen. Deshalb setzen wir auf transparente
                        Voting-Prozesse und konstruktives Feedback.
                    </p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <Camera size={32} />
                        <span class="stat-number">100+</span>
                        <span class="stat-label">Wettbewerbe</span>
                    </div>
                    <div class="stat-card">
                        <Users size={32} />
                        <span class="stat-number">5k+</span>
                        <span class="stat-label">Fotografen</span>
                    </div>
                    <div class="stat-card">
                        <Award size={32} />
                        <span class="stat-number">500+</span>
                        <span class="stat-label">Gewinner</span>
                    </div>
                    <div class="stat-card">
                        <Heart size={32} />
                        <span class="stat-number">∞</span>
                        <span class="stat-label">Inspiration</span>
                    </div>
                </div>
            </div>
        </section>

        <div class="divider"></div>

        <section class="features-section">
            <h2 class="text-center">Was uns ausmacht</h2>
            <div class="grid grid-3 mt-3">
                <div class="feature-card">
                    <div class="icon-wrapper">
                        <Award size={24} />
                    </div>
                    <h3>Faire Wettbewerbe</h3>
                    <p>
                        Unsere Themen-Wettbewerbe werden von einer ausgewählten
                        Jury und der Community bewertet. Qualität gewinnt.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="icon-wrapper">
                        <Users size={24} />
                    </div>
                    <h3>Starke Community</h3>
                    <p>
                        Vernetze dich mit anderen Fotografen, tausche Tipps aus
                        und lerne von den Besten.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="icon-wrapper">
                        <Camera size={24} />
                    </div>
                    <h3>Fokus auf Fotografie</h3>
                    <p>
                        Keine Ablenkungen. Unser minimalistisches Design stellt
                        deine Bilder in den Vordergrund.
                    </p>
                </div>
            </div>
        </section>
    </div>
</div>

<style>
    .about-page {
        padding-bottom: var(--spacing-4xl);
    }

    .hero {
        background: var(--color-surface);
        padding: var(--spacing-4xl) 0;
        margin-bottom: var(--spacing-3xl);
        text-align: center;
    }

    .lead {
        font-size: 1.25rem;
        max-width: 600px;
        margin: 0 auto;
        color: var(--color-text-secondary);
    }

    .mission-section {
        margin-bottom: var(--spacing-4xl);
    }

    .text-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
    }

    .stat-card {
        background: var(--color-surface);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-sm);
        transition: transform 0.2s;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-card :global(svg) {
        color: var(--color-primary);
        margin-bottom: var(--spacing-xs);
    }

    .stat-number {
        font-size: 2rem;
        font-weight: 700;
        color: var(--color-text-primary);
        line-height: 1;
    }

    .stat-label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        font-weight: 500;
    }

    .feature-card {
        padding: var(--spacing-xl);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        text-align: center;
    }

    .icon-wrapper {
        width: 48px;
        height: 48px;
        background: var(--color-surface);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--spacing-md);
        color: var(--color-primary);
    }

    h3 {
        margin-bottom: var(--spacing-sm);
    }

    @media (max-width: 768px) {
        .hero {
            padding: var(--spacing-2xl) 0;
        }

        .stats-grid {
            margin-top: var(--spacing-xl);
        }
    }
</style>
