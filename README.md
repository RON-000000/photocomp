# Projektdokumentation – PhotoComp (Zürich Foto-Wettbewerb Plattform)

## Inhaltsverzeichnis

1. [Einordnung & Zielsetzung](#1-einordnung--zielsetzung)
2. [Zielgruppe & Stakeholder](#2-zielgruppe--stakeholder)
3. [Anforderungen & Umfang](#3-anforderungen--umfang)
4. [Vorgehen & Artefakte](#4-vorgehen--artefakte)
    - [Understand & Define](#41-understand--define)
    - [Sketch](#42-sketch)
    - [Decide](#43-decide)
    - [Prototype](#44-prototype)
    - [Validate](#45-validate)
5. [Erweiterungen [Optional]](#5-erweiterungen-optional)
6. [Projektorganisation [Optional]](#6-projektorganisation-optional)
7. [KI‑Deklaration](#7-ki‑deklaration)
8. [Anhang [Optional]](#8-anhang-optional)


<!-- WICHTIG: DIE KAPITELSTRUKTUR DARF NICHT VERÄNDERT WERDEN! -->

## 1. Einordnung & Zielsetzung

- **Kontext & Problem:** Fotografen in Zürich fehlt eine zentrale Plattform, um an lokalen Foto-Wettbewerben teilzunehmen, ihre Arbeiten zu präsentieren und Feedback von der Community sowie einer Fachjury zu erhalten. Bestehende Plattformen sind entweder zu global ausgerichtet oder bieten keine strukturierte Bewertungsmöglichkeit.

- **Ziele:**
  - Bereitstellung einer benutzerfreundlichen Plattform für die Teilnahme an thematischen Foto-Wettbewerben
  - Ermöglichung von Community-Voting und Jury-Bewertungen
  - Förderung der lokalen Fotografie-Community durch Feedback, Kommentare und Leaderboards
  - Aufbau eines Portfolios für teilnehmende Fotografen

- **Abgrenzung:** Keine allgemeine Social-Media-Plattform, kein Marktplatz für den Verkauf von Fotos, keine Bildbearbeitungsfunktionen.

## 2. Zielgruppe & Stakeholder

- **Primäre Zielgruppe:** Hobby- und semiprofessionelle Fotografen aus dem Raum Zürich, die an thematischen Wettbewerben teilnehmen und ihre Arbeit präsentieren möchten.

- **Weitere Stakeholder:**
  - **Jury-Mitglieder:** Erfahrene Fotografen oder Fachpersonen, die Bewertungen abgeben
  - **Administratoren:** Verwalten Wettbewerbe, Benutzerrollen und Plattforminhalte
  - **Sponsoren/Partner:** Potenzielle Preisstifter für Wettbewerbe

- **Annahmen:**
  - Nutzer sind mit grundlegenden Web-Anwendungen vertraut
  - Nutzer haben Zugang zu Digitalkameras oder Smartphones
  - Interesse an lokaler Vernetzung und Feedback besteht

## 3. Anforderungen & Umfang

- **Kernfunktionalität (Mindestumfang):**
  1. **Benutzerregistrierung & Authentifizierung** via Auth0 (OAuth 2.0)
  2. **Wettbewerbs-Übersicht:** Aktive, abgeschlossene und kommende Wettbewerbe durchsuchen
  3. **Foto-Einreichung:** Bilder mit Titel, Beschreibung und Metadaten (Kamera, Objektiv, Einstellungen) hochladen
  4. **Voting-System:** Community-Abstimmung (1 Stimme pro Nutzer pro Einreichung)
  5. **Jury-Bewertung:** Bewertungen auf einer Skala von 1-10 durch designierte Jury-Mitglieder
  6. **Kommentarfunktion:** Feedback zu Einreichungen hinterlassen
  7. **Leaderboard:** Rangliste basierend auf gewichteten Stimmen (Community + Jury)
  8. **Benutzerprofil:** Eigene Einreichungen und Statistiken einsehen, Profil bearbeiten

- **Akzeptanzkriterien:**
  - Nutzende können sich registrieren, anmelden und abmelden
  - Nutzende können aktive Wettbewerbe einsehen und Fotos einreichen
  - Nutzende können für Einreichungen abstimmen (max. 1x pro Einreichung)
  - Jury-Mitglieder können Bewertungen abgeben
  - Kommentare können hinzugefügt und (bei Berechtigung) gelöscht werden
  - Einreichungen können vor Ablauf der Deadline bearbeitet/gelöscht werden
  - Leaderboard zeigt aktuelle Rangliste basierend auf Stimmen

- **Erweiterungen:** Siehe Kapitel 5

## 4. Vorgehen & Artefakte

### 4.1 Understand & Define

- **Ausgangslage & Ziele:** Entwicklung einer lokalen Foto-Wettbewerb-Plattform für die Zürcher Fotografie-Community, die sowohl Community-Engagement als auch professionelles Jury-Feedback ermöglicht.

- **Zielgruppenverständnis:**
  - Befragung von Hobby-Fotografen zu Bedürfnissen und bestehenden Lösungen
  - Analyse bestehender Plattformen (500px, ViewBug, lokale Facebook-Gruppen)
  - Identifikation von Schmerzpunkten: fehlende lokale Vernetzung, keine strukturierte Bewertung

- **Wesentliche Erkenntnisse:**
  - Bedarf an thematischen, zeitlich begrenzten Wettbewerben
  - Wunsch nach konstruktivem Feedback, nicht nur Likes
  - Wichtigkeit einer einfachen, schnellen Einreichung (mobile-optimiert)
  - Interesse an Kombination aus Community- und Experten-Bewertung

### 4.2 Sketch

- **Variantenüberblick:**
  - **Variante A:** Portfolio-fokussiert – Nutzer laden Bilder hoch, Wettbewerbe sind sekundär
  - **Variante B:** Wettbewerb-zentriert – Wettbewerbe stehen im Mittelpunkt, Einreichungen nur im Wettbewerbskontext
  - **Variante C:** Hybrid – Wettbewerbe als Hauptfokus mit automatisch generiertem Portfolio aus Einreichungen

- **Skizzen:**
  - Variante A: Galerie-Grid als Startseite, Wettbewerbe in separatem Tab
  - Variante B: Aktive Wettbewerbe prominent auf Startseite, Hero-Section mit Call-to-Action
  - Variante C: Wettbewerbe zentral, Profil zeigt alle Einreichungen als Portfolio

### 4.3 Decide

- **Gewählte Variante & Begründung:** Variante B/C (Wettbewerb-zentriert mit Portfolio-Funktion)
  - **Entscheidkriterien:**
    - Klarer Fokus auf das Kernprodukt (Wettbewerbe)
    - Einfacher Einstieg für neue Nutzer
    - Motivierender Gamification-Aspekt durch Deadlines und Rankings
    - Portfolio entsteht automatisch aus Teilnahmen

- **End‑to‑End‑Ablauf:**
  1. Nutzer registriert sich via Auth0
  2. Nutzer durchsucht aktive Wettbewerbe auf der Startseite
  3. Nutzer wählt Wettbewerb und reicht Foto mit Metadaten ein
  4. Community stimmt ab, Jury bewertet
  5. Nach Deadline: Gewichtete Berechnung, Leaderboard aktualisiert
  6. Gewinner werden präsentiert, Portfolio wächst

- **Referenz‑Mockup:** _[URL/Screenshots hier einfügen]_

### 4.4 Prototype

- **Kernfunktionalität:**
  - Vollständiger Wettbewerbs-Lebenszyklus (Erstellen, Einreichen, Abstimmen, Abschliessen)
  - Authentifizierung mit Rollensystem (User, Jury, Admin)
  - Bild-Upload mit Client- und Server-seitiger Komprimierung
  - Community-Voting und Jury-Rating
  - Kommentarsystem mit Moderationsfunktionen

- **Deployment:** _[https://photocomp.netlify.app/]_

#### 4.4.1. Entwurf (Design)

- **Informationsarchitektur:**
  ```
  Startseite
  ├── Hero-Section (Call-to-Action)
  ├── Aktive Wettbewerbe
  ├── Featured Winner
  ├── Testimonials
  └── Statistiken

  Navigation
  ├── Wettbewerbe (Übersicht aller Wettbewerbe)
  ├── Einreichen (für authentifizierte Nutzer)
  ├── Über uns
  └── FAQ/Guidelines

  Wettbewerb-Detail
  ├── Beschreibung & Regeln
  ├── Einreichungen-Galerie
  ├── Leaderboard
  └── Jury-Panel (für Jury-Mitglieder)

  Profil
  ├── Benutzerinfo
  ├── Statistiken (Einreichungen, Siege, Stimmen)
  └── Portfolio (alle Einreichungen)

  Admin-Bereich
  ├── Dashboard mit Statistiken
  ├── Wettbewerbsverwaltung
  └── Benutzerverwaltung
  ```

- **Oberflächenentwürfe:**
  - **Startseite:** Minimalistisches Design mit Hero-Image von Zürich, prominenter CTA-Button, Karten für aktive Wettbewerbe mit Countdown
  - **Wettbewerb-Detail:** Header-Bild, Tabs für Einreichungen/Leaderboard, Grid-Galerie der Fotos
  - **Einreichungs-Detail:** Grosses Bild, Voting-Panel, Metadaten, Kommentar-Section
  - **Profil:** Avatar, Bio, Statistik-Cards, Grid der eigenen Einreichungen

- **Designentscheidungen:**
  - **Farbschema:** Schwarz (#000) als Primärfarbe für professionellen Look, Blau (#3b82f6) als Akzentfarbe
  - **Typografie:** Inter (Google Fonts) für gute Lesbarkeit
  - **Layout:** Grosszügige Whitespaces, klare visuelle Hierarchie
  - **Interaktion:** Dezente Schatten und Hover-Effekte, keine überladenen Animationen

#### 4.4.2. Umsetzung (Technik)

- **Technologie‑Stack:**
  - **Frontend:** SvelteKit 2.47.1, Svelte 5.41.0
  - **Backend:** SvelteKit Server Routes (Node.js)
  - **Datenbank:** MongoDB 7.0.0
  - **Authentifizierung:** Auth0 (auth0-spa-js 2.9.1), JOSE 5.10.0
  - **Bildverarbeitung:** Cloudinary 2.8.0, Sharp 0.34.5, browser-image-compression 2.0.2
  - **Validierung:** Zod 3.22.4
  - **Icons:** lucide-svelte 0.554.0
  - **Deployment:** Netlify (adapter-netlify 5.2.4)

- **Tooling:**
  - **IDE:** Visual Studio Code mit Svelte-Extension
  - **Build:** Vite 7.1.10
  - **Version Control:** Git/GitHub
  - **Deployment:** Netlify (automatisches Deployment via Git)

- **Struktur & Komponenten:**

  **Routen:**
  | Route | Beschreibung |
  |-------|-------------|
  | `/` | Startseite mit Hero, aktiven Wettbewerben, Featured Winner |
  | `/competitions` | Übersicht aller Wettbewerbe |
  | `/competitions/[id]` | Wettbewerb-Detailseite |
  | `/submit` | Foto-Einreichungsformular |
  | `/submissions/[id]` | Einreichungs-Detailseite |
  | `/submissions/[id]/edit` | Einreichung bearbeiten |
  | `/profile/[username]` | Benutzerprofil |
  | `/profile/edit` | Profil bearbeiten |
  | `/jury` | Jury-Dashboard |
  | `/jury/competitions/[id]` | Jury-Bewertungsseite |
  | `/admin` | Admin-Dashboard |
  | `/admin/competitions/create` | Wettbewerb erstellen |

  **Komponenten:**
  | Komponente | Funktion |
  |------------|----------|
  | `Header.svelte` | Navigation, User-Dropdown, Mobile-Menu |
  | `Footer.svelte` | Footer mit Links |
  | `CompetitionCard.svelte` | Wettbewerbs-Vorschau mit Countdown |
  | `SubmissionCard.svelte` | Einreichungs-Vorschau in Galerie |
  | `SubmissionDetail.svelte` | Vollständige Einreichungsansicht |
  | `VotingPanel.svelte` | Abstimmungs- und Jury-Rating UI |
  | `CommentSection.svelte` | Kommentarbereich |
  | `ImageUpload.svelte` | Drag-and-Drop Upload mit Komprimierung |
  | `Leaderboard.svelte` | Rangliste |
  | `DeleteButton.svelte` | Lösch-Button mit Bestätigung |

  **Stores:**
  - `auth0.js`: Authentifizierungsstatus, aktueller Benutzer, Auth0-Client
  - `competitions.js`: Wettbewerbs- und Einreichungsdaten

- **Daten & Schnittstellen:**

  **MongoDB Collections:**
  - `users`: Benutzerdaten, Rollen, Statistiken
  - `competitions`: Wettbewerbsdaten, Jury-Mitglieder, Gewichtung
  - `submissions`: Einreichungen mit Votes, Kommentaren, Metadaten
  - `juryRatings`: Jury-Bewertungen mit Kommentaren

  **API-Endpunkte (Auszug):**
  - `GET/POST /api/competitions` – Wettbewerbe auflisten/erstellen
  - `GET/PUT/DELETE /api/competitions/[id]` – Einzelner Wettbewerb
  - `POST /api/submissions` – Neue Einreichung
  - `POST /api/submissions/[id]/vote` – Abstimmen
  - `POST /api/submissions/[id]/comments` – Kommentieren
  - `POST /api/jury/ratings` – Jury-Bewertung abgeben
  - `POST /api/upload` – Bild zu Cloudinary hochladen

- **Besondere Entscheidungen:**
  - **Cookie-basierte Sessions mit DB-Verifikation:** Verhindert Cookie-Manipulation durch serverseitige Rollenprüfung
  - **Rate Limiting:** Schutz vor Missbrauch (5-30 Req/Min je nach Endpoint)
  - **Client- und Server-seitige Bildkomprimierung:** Optimale Balance zwischen Qualität und Performance
  - **Gewichtetes Voting:** Konfigurierbare Gewichtung zwischen Community (60%) und Jury (40%)

### 4.5 Validate

- **URL der getesteten Version:** _[Separate Deployment-URL einfügen]_

- **Ziele der Prüfung:**
  - Können Nutzer den Einreichungs-Workflow problemlos durchführen?
  - Ist das Voting-System verständlich?
  - Wie wird die Benutzeroberfläche wahrgenommen?
  - Gibt es Usability-Probleme bei der Navigation?

- **Vorgehen:** _[Moderiert/unmoderiert; remote/on-site]_

- **Stichprobe:** _[Profil und Anzahl der Testpersonen]_

- **Aufgaben/Szenarien:**
  1. Registriere dich auf der Plattform
  2. Finde einen aktiven Wettbewerb zum Thema [X]
  3. Reiche ein Foto mit allen erforderlichen Informationen ein
  4. Stimme für 3 verschiedene Einreichungen ab
  5. Hinterlasse einen Kommentar bei einer Einreichung
  6. Finde dein eigenes Profil und überprüfe deine Einreichung

- **Kennzahlen & Beobachtungen:** _[Erfolgsquote, Zeitbedarf, qualitative Findings]_

- **Zusammenfassung der Resultate:** _[2-4 Sätze zu den wichtigsten Erkenntnissen]_

- **Abgeleitete Verbesserungen:** _[Priorisierte Liste mit Begründungen]_

- **Umgesetzte Anpassungen:** _[Falls Verbesserungen bereits implementiert wurden]_

## 5. Erweiterungen [Optional]

### 5.1 Erweiterte Sicherheitsfunktionen
- **Beschreibung & Nutzen:** Implementation von Content Security Policy (CSP), verbesserte Authentifizierungsprüfung durch Datenbankabgleich
- **Umsetzung:** Security-Headers in Netlify-Konfiguration, serverseitige Cookie-Validierung gegen Datenbank
- **Abgrenzung:** Geht über Basis-Authentifizierung hinaus

### 5.2 Jury-System
- **Beschreibung & Nutzen:** Separates Bewertungssystem für designierte Jury-Mitglieder mit 1-10 Skala und optionalen Kommentaren
- **Umsetzung:** Eigene Collection `juryRatings`, Jury-Dashboard, gewichtete Berechnung
- **Abgrenzung:** Nicht Teil einer minimalen MVP-Lösung

### 5.3 Admin-Dashboard
- **Beschreibung & Nutzen:** Vollständige Verwaltungsoberfläche für Wettbewerbe und Benutzer
- **Umsetzung:** Admin-Routen mit Rollenschutz, CRUD-Operationen für Wettbewerbe, Rollenzuweisung
- **Abgrenzung:** Erweitert die Basisfunktionalität um Verwaltungsmöglichkeiten

## 6. Projektorganisation [Optional]

- **Repository & Struktur:**
  ```
  photocomp/
  ├── src/
  │   ├── lib/
  │   │   ├── components/     # Wiederverwendbare UI-Komponenten
  │   │   ├── server/         # Server-seitige Utilities (Auth, DB, Validation)
  │   │   ├── stores/         # Svelte Stores
  │   │   └── api.js          # API-Client-Funktionen
  │   ├── routes/
  │   │   ├── api/            # API-Endpunkte
  │   │   ├── admin/          # Admin-Bereich
  │   │   ├── competitions/   # Wettbewerbs-Seiten
  │   │   ├── jury/           # Jury-Bereich
  │   │   ├── profile/        # Profil-Seiten
  │   │   └── submissions/    # Einreichungs-Seiten
  │   └── app.css             # Globale Styles
  ├── static/                 # Statische Assets
  └── netlify.toml            # Deployment-Konfiguration
  ```

- **Issue‑Management:** GitHub Issues für Bug-Tracking und Feature-Requests

- **Commit‑Praxis:** Konventionelle Commits (feat:, fix:, chore:, docs:) mit aussagekräftigen Beschreibungen

## 7. KI‑Deklaration

### Eingesetzte KI‑Werkzeuge
_[GitHub Copilot, Claude 4.5 Sonnet, Claude Opus 4.5]_

### Zweck & Umfang
_[Beschreiben Sie hier, wie, wofür und in welchem Ausmass KI eingesetzt wurde:]_
- Code-Vorschläge und Autovervollständigung
- Debugging und Fehlerbehebung
- Refactoring-Empfehlungen
- Dokumentationserstellung
- Überlegungen zu Qualität und Urheberrecht

### Art der Beiträge
_[Welche Teile stammen (ganz/teilweise) aus KI-Unterstützung?]_

### Eigene Leistung (Abgrenzung)
_[Was wurde eigenständig erarbeitet/überarbeitet?]_

### Reflexion
_[Nutzen, Grenzen, Risiken/Qualitätssicherung bei der KI-Nutzung]_

### Prompt‑Vorgehen [Optional]
_[Wichtige Prompts/Workflows in Kürze]_

### Quellen & Rechte [Optional]
_[Verwendete Vorlagen/Assets/Modelle; Lizenz/Urheberrecht; Zitierweise]_

## 8. Anhang [Optional]

- **Testskript & Materialien:** _[Link/Datei]_
- **Rohdaten/Auswertung:** _[Link/Datei]_

---

<!-- Prüfliste (nicht abgeben, nur intern nutzen) -->
<!--
[ ] Kernfunktionalität gemäss Übungen umgesetzt (Workflows durchgängig)
[ ] Akzeptanzkriterien formuliert und erfüllt
[ ] Skizzen erstellt (mehrere Varianten, Unterschiede dokumentiert)
[ ] Referenz‑Mockup in Decide verlinkt (URL/Screenshots)
[ ] Deployment erreichbar
[ ] Umsetzung (Technik) vollständig (Technologie‑Stack; Tooling & KI‑Einsatz inkl. Überlegungen; Struktur/Komponenten; Daten/Schnittstellen falls genutzt)
[ ] Evaluation durchgeführt; Ergebnisse dokumentiert; Verbesserungen abgeleitet
[ ] Dokumentation vollständig, klar strukturiert und konsistent
[ ] KI‑Deklaration ausgefüllt (Werkzeuge; Zweck & Umfang; Art der Beiträge; Abgrenzung; Quellen & Rechte; optional: Prompt‑Vorgehen, Reflexion)
[ ] Erweiterungen (falls vorhanden) begründet und abgegrenzt
[ ] Anhang gepflegt (Testskript/Materialien, Rohdaten/Auswertung) [optional]
-->
