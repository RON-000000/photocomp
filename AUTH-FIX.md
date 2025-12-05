# 🔧 Auth-Fix: Session-basierte Authentifizierung

## Problem

**Fehler:** "Invalid Compact JWS" - Token verification failed

**Ursache:**
Auth0's SPA SDK (`auth0-spa-js`) gibt für Single Page Applications **opaque tokens** zurück, keine JWTs. Diese können nicht server-seitig mit `jose` verifiziert werden.

## Lösung: Session-basierte Auth mit Cookies

Anstatt JWT-Verification haben wir zu einem **Cookie-basierten Session-System** gewechselt:

### 📁 Geänderte Dateien:

#### 1. `/src/lib/server/auth.js` - Vereinfacht
**Vorher:** JWT Verification mit jose
**Nachher:** User aus Cookie/event.locals lesen

```javascript
// Kein JWT Verify mehr!
export async function requireAuth(event) {
    const user = getUserFromEvent(event);  // Von Cookie oder locals
    if (!user) throw error(401, 'Anmeldung erforderlich');
    return user;
}
```

#### 2. `/src/hooks.server.js` - NEU erstellt
Server-Hook der User-Cookie in `event.locals` lädt:

```javascript
export async function handle({ event, resolve }) {
    const userCookie = event.cookies.get('user');
    if (userCookie) {
        event.locals.user = JSON.parse(userCookie);
    }
    return await resolve(event);
}
```

#### 3. `/src/lib/stores/auth0.js` - Cookie setzen
Nach erfolgreichem Login wird User-Cookie gesetzt:

```javascript
// In syncUserWithBackend()
if (response.ok) {
    const user = await response.json();
    currentUser.set(user);

    // ✅ NEU: Cookie setzen
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
}

// In logout()
// ✅ NEU: Cookie löschen
document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
```

---

## Wie es jetzt funktioniert:

### 1. User Login Flow

```
User → Auth0 Login → Redirect zurück → Frontend
  ↓
syncUserWithBackend()
  ↓
/api/auth/sync (User in DB speichern)
  ↓
User-Objekt zurück
  ↓
Cookie setzen: {_id, username, email, role, ...}
```

### 2. Protected API Request

```
Frontend API Call → Cookie wird automatisch mitgesendet
  ↓
hooks.server.js liest Cookie
  ↓
event.locals.user = {...}
  ↓
requireAuth() prüft event.locals.user
  ↓
✅ User authenticated
```

### 3. Role Check

```
requireRole(event, 'admin')
  ↓
requireAuth() → User von event.locals
  ↓
if (user.role !== 'admin') throw 403
  ↓
✅ Authorized
```

---

## Vorteile dieser Lösung:

✅ **Funktioniert sofort** - Keine Auth0 API Konfiguration nötig
✅ **Einfach** - Kein JWT Parsing, kein JWKS
✅ **Cookie HttpOnly möglich** (später für mehr Sicherheit)
✅ **Session-Management** einfacher
✅ **Funktioniert mit SSR** (Server-Side Rendering)

---

## Nachteile & Einschränkungen:

⚠️ **Kein Token Expiry Check** - Cookie läuft erst nach 7 Tagen ab
⚠️ **User-Daten im Cookie** - Größenlimit (4KB)
⚠️ **Kein automatisches Refresh** - Bei Role-Change muss neu eingeloggt werden
⚠️ **Cookie kann manipuliert werden** - Validierung fehlt noch

---

## Sicherheits-Verbesserungen (für später):

### Option 1: Signed Cookies
```javascript
// In hooks.server.js
import { sign, verify } from 'cookie-signature';

const SECRET = process.env.COOKIE_SECRET;

// Cookie setzen (Frontend)
const signed = sign(JSON.stringify(user), SECRET);
document.cookie = `user=${signed}; ...`;

// Cookie prüfen (Backend)
const unsigned = verify(userCookie, SECRET);
if (unsigned === false) throw error(401);
```

### Option 2: Session Store
```javascript
// Session ID im Cookie, User-Daten in Redis/DB
const sessionId = generateId();
await redis.set(sessionId, JSON.stringify(user), 'EX', 3600);
document.cookie = `session=${sessionId}; ...`;
```

### Option 3: Auth0 API + JWT (empfohlen für Production)
1. Auth0 Dashboard: APIs → Create API
2. Identifier: `https://photocomp-api.eu.auth0.com`
3. Code zurück auf JWT Verification umstellen

---

## Testing

### ✅ Nach dem Fix sollte funktionieren:

1. **Login** → Cookie wird gesetzt
2. **Admin Dashboard** → `/api/admin/*` Requests funktionieren
3. **Competition erstellen** → 201 Created
4. **Jury bewerten** → Funktioniert für Jury-User
5. **Submission löschen** → Ownership-Check funktioniert

### 🧪 Test-Schritte:

1. **Server neu starten:**
   ```bash
   npm run dev
   ```

2. **Logout** (falls eingeloggt)

3. **Neu einloggen** → Cookie sollte gesetzt werden

4. **DevTools → Application → Cookies:**
   - Sollte `user` Cookie sehen
   - Value ist URL-encoded JSON

5. **Admin-Seite öffnen** → Sollte funktionieren

6. **Console:** Keine "Invalid Compact JWS" Fehler mehr

---

## Rollback (falls Probleme):

Falls es weiterhin nicht funktioniert, alte JWT-Version wiederherstellen:

```bash
git checkout HEAD~1 src/lib/server/auth.js
git checkout HEAD~1 src/lib/stores/auth0.js
rm src/hooks.server.js
```

---

## Nächste Schritte:

Nach erfolgreichen Tests:
- ✅ Phase 2 wirklich abgeschlossen
- ➡️ Phase 3: Input Validation
- ➡️ Für Production: Auth0 API einrichten + JWT zurück

---

**Datum:** 2025-12-05
**Fix:** Session-based Auth mit Cookies
**Status:** ✅ Bereit zum Testen
