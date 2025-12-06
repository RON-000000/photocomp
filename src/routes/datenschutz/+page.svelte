<script>
    import { Shield, Server, Cookie, User, Mail, Lock } from "lucide-svelte";
</script>

<svelte:head>
    <title>Datenschutzerklärung - PhotoComp</title>
    <meta
        name="description"
        content="Informationen zum Datenschutz bei PhotoComp. Erfahren Sie, wie wir Ihre Daten schützen."
    />
</svelte:head>

<div class="privacy-page">
    <div class="hero">
        <div class="container">
            <h1>Datenschutzerklärung</h1>
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
                    <Shield size={24} />
                    <h2>1. Verantwortliche Stelle</h2>
                </div>
                <p>
                    Verantwortlich für die Datenverarbeitung auf dieser Website
                    ist:
                </p>
                <p>
                    <strong>PhotoComp Project</strong><br />
                    Ron Schwarz<br />
                    E-Mail:
                    <a href="mailto:schwaro4@students.zhaw.ch"
                        >schwaro4@students.zhaw.ch</a
                    >
                </p>
                <p>
                    Weitere Angaben finden Sie im <a href="/impressum"
                        >Impressum</a
                    >.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <Server size={24} />
                    <h2>2. Datenerfassung auf unserer Website</h2>
                </div>

                <h3>Server-Log-Dateien</h3>
                <p>
                    Der Provider der Seiten erhebt und speichert automatisch
                    Informationen in so genannten Server-Log-Dateien, die Ihr
                    Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul>
                    <li>Browsertyp und Browserversion</li>
                    <li>Verwendetes Betriebssystem</li>
                    <li>Referrer URL</li>
                    <li>Hostname des zugreifenden Rechners</li>
                    <li>Uhrzeit der Serveranfrage</li>
                    <li>IP-Adresse</li>
                </ul>
                <p>
                    Eine Zusammenführung dieser Daten mit anderen Datenquellen
                    wird nicht vorgenommen.
                </p>

                <h3>Registrierung (Auth0)</h3>
                <p>
                    Für die Authentifizierung nutzen wir den Dienst <strong
                        >Auth0</strong
                    >. Wenn Sie sich bei uns registrieren oder anmelden, werden
                    Sie auf die Server von Auth0 weitergeleitet. Auth0
                    verarbeitet Ihre Login-Daten (E-Mail, Passwort oder
                    Social-Login-Daten) in unserem Auftrag.
                </p>

                <h3>Bild-Uploads (Cloudinary)</h3>
                <p>
                    Bilder, die Sie für Wettbewerbe hochladen, werden auf den
                    Servern von <strong>Cloudinary</strong> gespeichert und verarbeitet
                    (z.B. Optimierung der Dateigrösse).
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <Cookie size={24} />
                    <h2>3. Cookies</h2>
                </div>
                <p>
                    Unsere Website verwendet Cookies. Das sind kleine
                    Textdateien, die Ihr Webbrowser auf Ihrem Endgerät
                    speichert. Cookies helfen uns dabei, unser Angebot
                    nutzerfreundlicher, effektiver und sicherer zu machen.
                </p>
                <p>
                    Wir verwenden hauptsächlich sogenannte "Session-Cookies".
                    Sie werden nach Ende Ihres Besuchs automatisch gelöscht.
                    Andere Cookies bleiben auf Ihrem Endgerät gespeichert, bis
                    Sie diese löschen (z.B. um Ihren Login-Status zu speichern).
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <Lock size={24} />
                    <h2>4. Datensicherheit</h2>
                </div>
                <p>
                    Wir nutzen aus Sicherheitsgründen und zum Schutz der
                    Übertragung vertraulicher Inhalte, wie zum Beispiel
                    Bestellungen oder Anfragen, die Sie an uns als
                    Seitenbetreiber senden, eine SSL-bzw. TLS-Verschlüsselung.
                </p>
            </section>

            <div class="divider"></div>

            <section class="section">
                <div class="section-header">
                    <User size={24} />
                    <h2>5. Ihre Rechte</h2>
                </div>
                <p>Sie haben jederzeit das Recht:</p>
                <ul>
                    <li>
                        Unentgeltlich Auskunft über Herkunft, Empfänger und
                        Zweck Ihrer gespeicherten personenbezogenen Daten zu
                        erhalten.
                    </li>
                    <li>
                        Die Berichtigung, Sperrung oder Löschung dieser Daten zu
                        verlangen.
                    </li>
                    <li>
                        Eine erteilte Einwilligung zur Datenverarbeitung
                        jederzeit zu widerrufen.
                    </li>
                </ul>
                <p>
                    Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können
                    Sie sich jederzeit unter der im Impressum angegebenen
                    Adresse an uns wenden.
                </p>
            </section>
        </div>
    </div>
</div>

<style>
    .privacy-page {
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

    h3 {
        font-size: 1.1rem;
        margin: var(--spacing-lg) 0 var(--spacing-sm);
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

    a {
        color: var(--color-primary);
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    .divider {
        height: 1px;
        background: var(--color-border);
        margin: var(--spacing-xl) 0;
    }
</style>
