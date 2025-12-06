<script>
    import {
        Shield,
        Camera,
        Gavel,
        HeartHandshake,
        AlertTriangle,
        CheckCircle,
    } from "lucide-svelte";
</script>

<svelte:head>
    <title>Richtlinien & Regeln - PhotoComp</title>
    <meta
        name="description"
        content="Unsere Richtlinien für faire Wettbewerbe, Einreichungen und ein respektvolles Miteinander."
    />
</svelte:head>

<div class="guidelines-page">
    <div class="hero">
        <div class="container">
            <h1>Richtlinien & Regeln</h1>
            <p class="lead">
                Damit PhotoComp für alle ein inspirierender Ort bleibt, bitten
                wir dich, diese Regeln zu beachten.
            </p>
        </div>
    </div>

    <div class="container content">
        <div class="grid grid-2">
            <!-- Section 1: General -->
            <section class="card">
                <div class="card-header">
                    <Shield size={24} />
                    <h2>Allgemeine Regeln</h2>
                </div>
                <ul class="rule-list">
                    <li>
                        <strong>Urheberrecht:</strong> Du darfst nur Fotos einreichen,
                        die du selbst aufgenommen hast und an denen du alle Rechte
                        besitzt.
                    </li>
                    <li>
                        <strong>Fair Play:</strong> Manipuliere keine Votings. Mehrfache
                        Accounts oder Voting-Absprachen führen zum Ausschluss.
                    </li>
                    <li>
                        <strong>Aktualität:</strong> Reiche bitte keine Bilder ein,
                        die älter als 5 Jahre sind, es sei denn, das Thema verlangt
                        es explizit.
                    </li>
                </ul>
            </section>

            <!-- Section 2: Submissions -->
            <section class="card">
                <div class="card-header">
                    <Camera size={24} />
                    <h2>Einreichungen</h2>
                </div>
                <ul class="rule-list">
                    <li>
                        <div class="rule-item">
                            <AlertTriangle size={18} class="text-warning" />
                            <strong>Keine KI-Generierung:</strong> Bilder, die vollständig
                            oder teilweise durch KI (Midjourney, DALL-E, etc.) erstellt
                            wurden, sind nicht zugelassen.
                        </div>
                    </li>
                    <li>
                        <strong>Bearbeitung:</strong> Standard-Bearbeitungen (Licht,
                        Farbe, Beschnitt, Retusche) sind erlaubt. Composings müssen
                        als solche gekennzeichnet sein.
                    </li>
                    <li>
                        <strong>Format:</strong> JPG, PNG oder WebP. Mindestens 2000px
                        an der langen Kante empfohlen. Max. 100MB (wird komprimiert).
                    </li>
                </ul>
            </section>

            <!-- Section 3: Voting -->
            <section class="card">
                <div class="card-header">
                    <Gavel size={24} />
                    <h2>Bewertung</h2>
                </div>
                <p class="mb-4">
                    Unsere Wettbewerbe werden durch eine Kombination aus
                    Jury-Voting und Community-Voting entschieden.
                </p>
                <ul class="rule-list">
                    <li>
                        <strong>Jury:</strong> Bewertet nach technischer Qualität,
                        Komposition und Themen-Relevanz.
                    </li>
                    <li>
                        <strong>Community:</strong> Bewertet nach persönlichem Geschmack
                        und Gesamteindruck.
                    </li>
                </ul>
            </section>

            <!-- Section 4: Code of Conduct -->
            <section class="card">
                <div class="card-header">
                    <HeartHandshake size={24} />
                    <h2>Code of Conduct</h2>
                </div>
                <p class="mb-4">Wir pflegen einen respektvollen Umgangston.</p>
                <ul class="rule-list">
                    <li>
                        <CheckCircle size={18} class="text-success" />
                        <strong>Konstruktives Feedback:</strong> Kritik ist willkommen,
                        wenn sie hilft, besser zu werden.
                    </li>
                    <li>
                        <AlertTriangle size={18} class="text-danger" />
                        <strong>Kein Hate Speech:</strong> Beleidigungen, Diskriminierung
                        oder Belästigung werden nicht toleriert.
                    </li>
                </ul>
            </section>
        </div>
    </div>
</div>

<style>
    .guidelines-page {
        padding-bottom: var(--spacing-4xl);
    }

    .hero {
        background: var(--color-surface);
        padding: var(--spacing-3xl) 0;
        margin-bottom: var(--spacing-3xl);
        text-align: center;
    }

    .lead {
        font-size: 1.125rem;
        max-width: 600px;
        margin: 0 auto;
        color: var(--color-text-secondary);
    }

    .card {
        background: white;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        height: 100%;
    }

    .card-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--color-border);
    }

    .card-header :global(svg) {
        color: var(--color-primary);
    }

    h2 {
        font-size: 1.25rem;
        margin: 0;
    }

    .rule-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .rule-list li {
        margin-bottom: var(--spacing-md);
        line-height: 1.5;
        color: var(--color-text-secondary);
    }

    .rule-list strong {
        color: var(--color-text-primary);
        font-weight: 600;
    }

    .rule-item {
        display: flex;
        gap: var(--spacing-sm);
        align-items: flex-start;
    }

    .rule-item :global(svg) {
        flex-shrink: 0;
        margin-top: 2px;
    }

    .text-warning {
        color: var(--color-warning);
    }
    .text-danger {
        color: var(--color-danger);
    }
    .text-success {
        color: var(--color-success);
    }
    .mb-4 {
        margin-bottom: var(--spacing-md);
    }

    @media (max-width: 768px) {
        .grid-2 {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
        }
    }
</style>
