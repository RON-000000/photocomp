<script>
    import {
        FileText,
        ShieldCheck,
        UserCheck,
        Copyright,
        AlertOctagon,
        Scale,
    } from "lucide-svelte";
</script>

<svelte:head>
    <title>Allgemeine Geschäftsbedingungen (AGB) - PhotoComp</title>
    <meta
        name="description"
        content="Allgemeine Geschäftsbedingungen für die Nutzung von PhotoComp."
    />
</svelte:head>

<div class="agb-page">
    <div class="hero">
        <div class="container">
            <h1>Allgemeine Geschäftsbedingungen</h1>
            <p class="lead">
                Stand: {new Date().toLocaleDateString("de-DE", {
                    month: "long",
                    year: "numeric",
                })}
            </p>
        </div>
    </div>

    <div class="container content">
        <div class="card">
            <section class="section">
                <div class="section-header">
                    <FileText size={24} />
                    <h2>1. Geltungsbereich</h2>
                </div>
                <p>
                    Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB")
                    gelten für die Nutzung der Plattform PhotoComp. Mit der
                    Registrierung eines Benutzerkontos oder der Teilnahme an
                    einem Wettbewerb erklären Sie sich mit diesen AGB
                    einverstanden.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <ShieldCheck size={24} />
                    <h2>2. Leistungsbeschreibung</h2>
                </div>
                <p>
                    PhotoComp stellt eine Plattform zur Verfügung, auf der
                    Nutzer an Fotowettbewerben teilnehmen, Bilder hochladen und
                    die Werke anderer Nutzer bewerten können. Die Nutzung der
                    Grundfunktionen ist kostenlos.
                </p>
                <p>
                    Wir bemühen uns um eine möglichst unterbrechungsfreie
                    Verfügbarkeit der Plattform, können diese jedoch nicht
                    garantieren. Wartungsarbeiten oder technische Störungen
                    können zu vorübergehenden Einschränkungen führen.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <UserCheck size={24} />
                    <h2>3. Nutzerkonto</h2>
                </div>
                <p>
                    Für die aktive Teilnahme (Upload, Voting) ist eine
                    Registrierung erforderlich. Sie sind verpflichtet,
                    wahrheitsgemässe Angaben zu machen und Ihre Zugangsdaten
                    geheim zu halten.
                </p>
                <p>
                    Pro Person ist nur ein Nutzerkonto erlaubt.
                    Mehrfachanmeldungen zur Manipulation von
                    Wettbewerbsergebnissen führen zur sofortigen Sperrung aller
                    betroffenen Konten.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <Copyright size={24} />
                    <h2>4. Nutzungsrechte & Urheberrecht</h2>
                </div>
                <p>
                    <strong
                        >Das Wichtigste zuerst: Sie behalten das volle
                        Urheberrecht an Ihren Bildern.</strong
                    >
                </p>
                <p>
                    Mit dem Hochladen eines Bildes räumen Sie PhotoComp jedoch
                    ein einfaches, unentgeltliches, räumlich und zeitlich
                    unbeschränktes Nutzungsrecht ein, das Bild im Rahmen des
                    Wettbewerbs und zur Bewerbung der Plattform zu nutzen. Dies
                    umfasst insbesondere:
                </p>
                <ul>
                    <li>
                        Die Darstellung auf der Website (Galerie, Voting,
                        Gewinnerseite).
                    </li>
                    <li>
                        Die Nutzung auf den offiziellen Social-Media-Kanälen von
                        PhotoComp (mit Namensnennung).
                    </li>
                </ul>
                <p>
                    Sie garantieren, dass Sie über alle erforderlichen Rechte an
                    den hochgeladenen Bildern verfügen und keine Rechte Dritter
                    (z.B. Persönlichkeitsrechte abgebildeter Personen)
                    verletzen.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <AlertOctagon size={24} />
                    <h2>5. Verbotene Inhalte</h2>
                </div>
                <p>Es ist untersagt, Inhalte hochzuladen, die:</p>
                <ul>
                    <li>Gegen geltende Gesetze verstossen.</li>
                    <li>
                        Pornografisch, gewaltverherrlichend, rassistisch oder
                        diskriminierend sind.
                    </li>
                    <li>Werbung für Dritte enthalten.</li>
                    <li>Schadsoftware enthalten.</li>
                </ul>
                <p>
                    PhotoComp behält sich das Recht vor, Inhalte, die gegen
                    diese Regeln verstossen, ohne Vorankündigung zu löschen und
                    den Nutzer zu sperren.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <Scale size={24} />
                    <h2>6. Haftung</h2>
                </div>
                <p>
                    PhotoComp haftet nur für Schäden, die auf vorsätzlicher oder
                    grob fahrlässiger Pflichtverletzung beruhen. Für den Verlust
                    von Daten (z.B. hochgeladene Bilder) wird keine Haftung
                    übernommen. Nutzer sind selbst für die Sicherung ihrer Daten
                    verantwortlich.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <Scale size={24} />
                    <h2>7. Schlussbestimmungen</h2>
                </div>
                <p>
                    Es gilt das Recht der Schweizerischen Eidgenossenschaft.
                    Gerichtsstand ist Winterthur. Sollten einzelne Bestimmungen
                    dieser AGB unwirksam sein, bleibt die Wirksamkeit der
                    übrigen Bestimmungen unberührt.
                </p>
            </section>
        </div>
    </div>
</div>

<style>
    .agb-page {
        padding-bottom: var(--spacing-4xl);
    }

    .hero {
        background: var(--color-surface);
        padding: var(--spacing-3xl) 0;
        margin-bottom: var(--spacing-3xl);
        text-align: center;
    }

    .lead {
        font-size: 1rem;
        color: var(--color-text-secondary);
    }

    .content {
        max-width: 800px;
    }

    .card {
        background: white;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
    }

    .section {
        margin-bottom: var(--spacing-xl);
    }

    .section:last-child {
        margin-bottom: 0;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }

    .section-header :global(svg) {
        color: var(--color-primary);
    }

    h2 {
        font-size: 1.25rem;
        margin: 0;
        color: var(--color-text-primary);
    }

    p,
    li {
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin-bottom: var(--spacing-md);
    }

    ul {
        margin-bottom: var(--spacing-md);
        padding-left: var(--spacing-xl);
    }

    li {
        margin-bottom: var(--spacing-xs);
    }

    .divider {
        height: 1px;
        background: var(--color-border);
        margin: var(--spacing-xl) 0;
    }
</style>
