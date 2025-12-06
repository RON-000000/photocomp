<script>
    import { Mail, MapPin } from "lucide-svelte";
</script>

<svelte:head>
    <title>Impressum - PhotoComp</title>
    <meta
        name="description"
        content="Impressum von PhotoComp. Kontaktinformationen und rechtliche Hinweise."
    />
</svelte:head>

<div class="impressum-page">
    <div class="hero">
        <div class="container">
            <h1>Impressum</h1>
        </div>
    </div>

    <div class="container content">
        <div class="card">
            <section class="section">
                <h2>Kontaktadresse</h2>
                <p>
                    <strong>PhotoComp Project</strong><br />
                    Ron Schwarz<br />
                </p>
                <p class="contact-link">
                    <Mail size={18} />
                    <a href="mailto:schwaro4@students.zhaw.ch"
                        >schwaro4@students.zhaw.ch</a
                    >
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <h2>Haftungsausschluss</h2>
                <p>
                    Der Autor übernimmt keinerlei Gewähr hinsichtlich der
                    inhaltlichen Richtigkeit, Genauigkeit, Aktualität,
                    Zuverlässigkeit und Vollständigkeit der Informationen.
                    Haftungsansprüche gegen den Autor wegen Schäden materieller
                    oder immaterieller Art, welche aus dem Zugriff oder der
                    Nutzung bzw. Nichtnutzung der veröffentlichten
                    Informationen, durch Missbrauch der Verbindung oder durch
                    technische Störungen entstanden sind, werden ausgeschlossen.
                </p>
                <p>
                    Alle Angebote sind unverbindlich. Der Autor behält es sich
                    ausdrücklich vor, Teile der Seiten oder das gesamte Angebot
                    ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu
                    löschen oder die Veröffentlichung zeitweise oder endgültig
                    einzustellen.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <h2>Haftung für Links</h2>
                <p>
                    Verweise und Links auf Webseiten Dritter liegen ausserhalb
                    unseres Verantwortungsbereichs Es wird jegliche
                    Verantwortung für solche Webseiten abgelehnt. Der Zugriff
                    und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr
                    des Nutzers oder der Nutzerin.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <h2>Urheberrechte</h2>
                <p>
                    Die Urheber- und alle anderen Rechte an Inhalten, Bildern,
                    Fotos oder anderen Dateien auf der Website gehören
                    ausschliesslich <strong>PhotoComp</strong> oder den speziell
                    genannten Rechtsinhabern (den Fotografen). Für die Reproduktion
                    jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger
                    im Voraus einzuholen.
                </p>
            </section>
        </div>
    </div>
</div>

<style>
    .impressum-page {
        padding-bottom: var(--spacing-4xl);
    }

    .hero {
        background: var(--color-surface);
        padding: var(--spacing-3xl) 0;
        margin-bottom: var(--spacing-3xl);
        text-align: center;
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

    h2 {
        font-size: 1.25rem;
        margin-bottom: var(--spacing-md);
        color: var(--color-text-primary);
    }

    p {
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-md);
    }

    .contact-link {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--color-primary);
        font-weight: 500;
    }

    .contact-link :global(svg) {
        color: var(--color-primary);
    }

    .divider {
        height: 1px;
        background: var(--color-border);
        margin: var(--spacing-xl) 0;
    }
</style>
