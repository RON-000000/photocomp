# Auth-Middleware Test Plan

## Phase 2 Implementation Tests

### ✅ Was wurde implementiert:

1. **Auth-Middleware** (`src/lib/server/auth.js`)
   - JWT Token Verification mit Auth0
   - Role-Based Access Control (RBAC)
   - Ownership Checks

2. **Geschützte Endpoints:**
   - `/api/admin/*` - Nur Admin
   - `/api/jury/*` - Jury + Admin
   - `/api/competitions` POST/PUT/DELETE - Nur Admin
   - `/api/submissions/[id]` DELETE - Nur Eigentümer oder Admin

3. **Frontend Auth-Headers:**
   - Alle geschützten API-Calls senden jetzt Bearer Token

---

## Test-Szenarien

### 🧪 Test 1: Admin-Endpoint ohne Authentication
**Erwartetes Ergebnis:** 401 Unauthorized

```bash
curl -X GET http://localhost:5173/api/admin/users
```

**Erwartete Response:**
```json
{"error": "Anmeldung erforderlich"}
```

---

### 🧪 Test 2: Admin-Endpoint mit ungültigem Token
**Erwartetes Ergebnis:** 401 Unauthorized

```bash
curl -X GET http://localhost:5173/api/admin/users \
  -H "Authorization: Bearer invalid_token_123"
```

**Erwartete Response:**
```json
{"error": "Ungültiger oder abgelaufener Token"}
```

---

### 🧪 Test 3: Jury-Endpoint als normaler User
**Erwartetes Ergebnis:** 403 Forbidden

**Voraussetzung:** User ist angemeldet, hat aber role='user'

**Erwartete Response:**
```json
{"error": "Keine Berechtigung für diese Aktion"}
```

---

### 🧪 Test 4: Submission DELETE - fremde Submission
**Erwartetes Ergebnis:** 403 Forbidden

**Szenario:** User A versucht Submission von User B zu löschen

**Erwartete Response:**
```json
{"error": "Keine Berechtigung zum Löschen dieser Submission"}
```

---

### 🧪 Test 5: Submission DELETE - eigene Submission
**Erwartetes Ergebnis:** 200 Success

**Szenario:** User löscht seine eigene Submission

**Erwartete Response:**
```json
{"success": true, "message": "Submission erfolgreich gelöscht"}
```

---

### 🧪 Test 6: Admin kann alles
**Erwartetes Ergebnis:** 200 Success

**Szenario:** Admin kann fremde Submissions löschen

---

## Frontend Auth Token Flow

### 1. User Login
```javascript
// In auth0.js - initAuth0()
const client = await createAuth0Client({...});
const authenticated = await client.isAuthenticated();
```

### 2. Token wird geholt
```javascript
// In api.js - getAuthHeaders()
const token = await auth0ClientInstance.getTokenSilently();
headers['Authorization'] = `Bearer ${token}`;
```

### 3. Token wird gesendet
```javascript
// In api.js - createSubmission()
const headers = await getAuthHeaders();
const response = await fetch('/api/submissions', {
  method: 'POST',
  headers,  // Enthält: Authorization: Bearer xxx
  body: JSON.stringify(data)
});
```

### 4. Backend verifiziert Token
```javascript
// In auth.js - requireAuth()
const token = extractToken(event.request);
const payload = await verifyToken(token);  // JWT Verify mit Auth0
const user = await getUserFromDb(payload.sub);
return user;
```

---

## Manuelle Browser-Tests

### Test im Browser:

1. **Als Admin anmelden**
   - Gehe zu `/admin`
   - Prüfe: Werden Users angezeigt?
   - Console: Sollte keine 401/403 Fehler zeigen

2. **Als normaler User**
   - Versuche `/admin` zu öffnen
   - Sollte: 403 Error in Console zeigen
   - Frontend sollte Error-Handling zeigen

3. **Submission erstellen**
   - Gehe zu `/submit`
   - Erstelle Submission
   - Console: Sollte Bearer Token im Request Header zeigen

4. **Eigene Submission löschen**
   - Gehe zu deinem Profil
   - Lösche eine Submission
   - Sollte funktionieren

5. **Fremde Submission löschen (nicht als Admin)**
   - Versuche fremde Submission zu löschen
   - Sollte: 403 Error zeigen

---

## Developer Tools Check

### Chrome DevTools Network Tab:

Prüfe einen geschützten Request (z.B. Competition erstellen):

```
Request Headers:
  authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6...
  content-type: application/json
```

### Console Logs:

Bei erfolgreicher Auth solltest du sehen:
```
🔍 Syncing user: {sub: "auth0|...", email: "..."}
✅ User synced: {_id: "...", username: "...", role: "..."}
```

Bei Auth-Fehler:
```
❌ Token verification failed: ...
```

---

## Bekannte Probleme & Lösungen

### Problem 1: "jose is not defined"
**Lösung:** `npm install jose` ausführen ✅ (bereits installiert)

### Problem 2: "audience validation failed"
**Lösung:** Audience-Validierung für SPA-Tokens übersprungen ✅

### Problem 3: Token wird nicht gesendet
**Prüfung:**
- Ist user angemeldet? (`$isAuthenticated` = true)
- Ist auth0ClientInstance gesetzt?
- Console Log in getAuthHeaders() hinzufügen

### Problem 4: User nicht in DB gefunden
**Lösung:** User muss zuerst eingeloggt werden, damit `/api/auth/sync` aufgerufen wird

---

## Nächste Schritte nach erfolgreichen Tests

✅ Phase 2 abgeschlossen
➡️ Phase 3: Input Validation (Zod)
➡️ Phase 4: Rate Limiting & CORS

---

## Wichtige Hinweise

⚠️ **Production:**
- Setze HTTPS enforcing
- Füge Security Headers hinzu
- Aktiviere Audit Logging für Admin-Aktionen

⚠️ **Auth0 API:**
Falls du später eine Auth0 API konfigurierst, update:
```javascript
// In auth.js
const AUTH0_AUDIENCE = 'https://your-api-identifier';

// In auth0.js (Frontend)
authorizationParams: {
  audience: 'https://your-api-identifier',
  redirect_uri: window.location.origin + '/auth/callback'
}
```
