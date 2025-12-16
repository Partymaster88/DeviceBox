# .env Datei Konfiguration

## Schnellstart

1. **Erstelle die .env Datei:**
```bash
cp .env.example .env
```

2. **Bearbeite die .env Datei:**
```bash
nano .env
```

## Wichtige Umgebungsvariablen

### GITHUB_WEBHOOK_SECRET (ERFORDERLICH für Auto-Deploy)

Dieses Secret wird verwendet, um GitHub Webhook-Anfragen zu verifizieren.

**So generierst du ein sicheres Secret:**
```bash
openssl rand -hex 32
```

**Beispiel:**
```
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Wichtig:** 
- Verwende dasselbe Secret in der .env Datei UND in den GitHub Webhook Settings
- Das Secret sollte lang und zufällig sein (mindestens 32 Zeichen)

### AP_SSID (Optional)

SSID (Name) des Access Points, wenn kein WiFi gefunden wird.

**Standard:** `DeviceBox-Setup`

**Beispiel:**
```
AP_SSID=Mein-DeviceBox-Setup
```

### AP_PASSWORD (Optional)

Passwort für den Access Point.

**Standard:** `DeviceBox123`

**Beispiel:**
```
AP_PASSWORD=MeinSicheresPasswort123
```

**Wichtig:** Verwende ein sicheres Passwort (mindestens 8 Zeichen)

### PORT (Optional)

Port für den Next.js Server.

**Standard:** `3000`

**Beispiel:**
```
PORT=8080
```

### NODE_ENV (Optional)

Node.js Umgebung.

**Standard:** `production`

**Beispiel:**
```
NODE_ENV=production
```

## Vollständige .env Beispiel-Datei

```env
# GitHub Webhook Secret (ERFORDERLICH für Auto-Deploy)
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# WiFi Access Point Konfiguration
AP_SSID=DeviceBox-Setup
AP_PASSWORD=DeviceBox123

# Next.js
NODE_ENV=production
PORT=3000
```

## GitHub Webhook Setup

Nachdem du die .env Datei konfiguriert hast:

1. Gehe zu deinem GitHub Repository → **Settings** → **Webhooks**
2. Klicke auf **"Add webhook"**
3. Konfiguriere:
   - **Payload URL**: `http://DEINE-IP:3000/api/webhook/github`
     - Ersetze `DEINE-IP` mit der IP-Adresse deines Raspberry Pi
     - Beispiel: `http://192.168.1.100:3000/api/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: Kopiere den Wert aus `GITHUB_WEBHOOK_SECRET` in deiner .env Datei
   - **Events**: Wähle **"Just the push event"**
4. Klicke auf **"Add webhook"**

## Nach dem Setup

Nach dem Ändern der .env Datei muss PM2 neu gestartet werden:

```bash
pm2 restart devicebox
```

Oder falls PM2 noch nicht läuft:

```bash
pm2 start ecosystem.config.js
```

## Sicherheit

- **NIEMALS** die .env Datei in Git committen (sie ist bereits in .gitignore)
- Verwende starke, zufällige Secrets
- Ändere die Standard-Passwörter für den Access Point

