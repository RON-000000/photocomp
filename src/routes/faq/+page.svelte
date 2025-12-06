<script>
    import { ChevronDown, ChevronUp, HelpCircle } from "lucide-svelte";
    import { slide } from "svelte/transition";

    let openIndex = null;

    const faqs = [
        {
            question: "Wie nehme ich an einem Wettbewerb teil?",
            answer: "Erstelle zunächst ein kostenloses Konto. Wähle dann unter 'Wettbewerbe' einen aktiven Wettbewerb aus und klicke auf 'Teilnehmen'. Du kannst dein Foto direkt hochladen. Achte darauf, dass es die Anforderungen erfüllt.",
        },
        {
            question: "Ist die Teilnahme kostenlos?",
            answer: "Ja, die Teilnahme an allen regulären Wettbewerben auf PhotoComp ist komplett kostenlos. Wir finanzieren uns durch Sponsoren und optionale Premium-Features.",
        },
        {
            question: "Was passiert mit meinen Bildrechten?",
            answer: "Du behältst zu jeder Zeit das volle Urheberrecht an deinen Bildern. Mit der Einreichung gibst du uns lediglich das Recht, dein Bild im Rahmen des Wettbewerbs auf unserer Plattform und Social Media Kanälen (mit Namensnennung) zu zeigen.",
        },
        {
            question: "Wie funktioniert das Voting?",
            answer: "Das Ergebnis setzt sich aus der Bewertung unserer Fachjury und aus dem Community-Voting zusammen. So stellen wir sicher, dass sowohl technische Qualität als auch Beliebtheit zählen.",
        },
        {
            question: "Kann ich meine Einreichung ändern?",
            answer: "Ja, solange die Einreichungsphase noch läuft, kannst du dein Bild jederzeit löschen und ein neues hochladen. Nach Ablauf der Frist sind keine Änderungen mehr möglich.",
        },
        {
            question: "Welche Bildformate sind erlaubt?",
            answer: "Wir akzeptieren JPG, PNG und WebP Dateien. Die maximale Dateigrösse beträgt 100MB (wird beim Upload optimiert). Wir empfehlen eine Auflösung von mindestens 2000 Pixeln an der langen Kante.",
        },
    ];

    function toggle(index) {
        openIndex = openIndex === index ? null : index;
    }
</script>

<svelte:head>
    <title>Häufig gestellte Fragen (FAQ) - PhotoComp</title>
    <meta
        name="description"
        content="Antworten auf die häufigsten Fragen zu PhotoComp, Wettbewerben, Voting und Bildrechten."
    />
</svelte:head>

<div class="faq-page">
    <div class="hero">
        <div class="container">
            <h1>Häufig gestellte Fragen</h1>
            <p class="lead">
                Hier findest du Antworten auf die wichtigsten Fragen rund um
                PhotoComp.
            </p>
        </div>
    </div>

    <div class="container content">
        <div class="faq-list">
            {#each faqs as faq, i}
                <div class="faq-item" class:open={openIndex === i}>
                    <button
                        class="faq-question"
                        on:click={() => toggle(i)}
                        aria-expanded={openIndex === i}
                    >
                        <span class="question-text">{faq.question}</span>
                        {#if openIndex === i}
                            <ChevronUp size={20} />
                        {:else}
                            <ChevronDown size={20} />
                        {/if}
                    </button>
                    {#if openIndex === i}
                        <div
                            class="faq-answer"
                            transition:slide={{ duration: 300 }}
                        >
                            <div class="answer-content">
                                {faq.answer}
                            </div>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <div class="contact-hint">
            <HelpCircle size={32} />
            <h3>Noch Fragen?</h3>
            <p>
                Schreib uns gerne eine E-Mail an <a
                    href="mailto:schwaro4@students.zhaw.ch">schwaro4@students.zhaw.ch</a
                >
            </p>
        </div>
    </div>
</div>

<style>
    .faq-page {
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

    .content {
        max-width: 800px;
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .faq-item {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background: white;
        overflow: hidden;
        transition: border-color 0.2s;
    }

    .faq-item.open {
        border-color: var(--color-primary);
    }

    .faq-question {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg);
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        font-family: var(--font-sans);
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text-primary);
        transition: background 0.2s;
    }

    .faq-question:hover {
        background: var(--color-surface);
    }

    .faq-question :global(svg) {
        color: var(--color-text-secondary);
        flex-shrink: 0;
        margin-left: var(--spacing-md);
    }

    .faq-item.open .faq-question :global(svg) {
        color: var(--color-primary);
    }

    .answer-content {
        padding: 0 var(--spacing-lg) var(--spacing-lg);
        color: var(--color-text-secondary);
        line-height: 1.6;
    }

    .contact-hint {
        margin-top: var(--spacing-4xl);
        text-align: center;
        padding: var(--spacing-2xl);
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .contact-hint :global(svg) {
        color: var(--color-primary);
        margin-bottom: var(--spacing-xs);
    }

    .contact-hint h3 {
        margin: 0;
    }
</style>
