# DeviceBox - Raspberry Pi Next.js Projekt

Ein vollständiges Next.js-Projekt für Raspberry Pi 5 mit automatischem WiFi Access Point, GitHub Auto-Deploy und mDNS-Unterstützung.

## Features

- 🌐 **Next.js Web Server** - Moderne Web-Anwendung mit React
- 📶 **Automatischer WiFi Access Point** - Öffnet automatisch einen Access Point, wenn keine WiFi-Verbindung gefunden wird
- 🔄 **GitHub Auto-Deploy** - Automatisches Deployment bei Git Push (funktioniert mit privaten Repositories)
- 🏠 **mDNS Support** - Erreichbar unter `devicebox.local` im lokalen Netzwerk
- 🚀 **PM2 Prozess Management** - Automatischer Neustart bei Fehlern
- 📦 **Einfache Installation** - Einzeiler Installationsskript

## Voraussetzungen

- Raspberry Pi 5 (oder kompatibel)
- Raspberry Pi OS (oder kompatibles Linux)
- Internet-Verbindung für Installation
- GitHub Repository (optional, für Auto-Deploy)

## Installation

### Einzeiler Installation

```bash
# Wenn das Repository bereits geklont wurde:
bash install.sh

# Oder direkt von GitHub (nach dem ersten Push):
curl -fsSL https://raw.githubusercontent.com/DEIN-USERNAME/DEIN-REPO/main/install.sh | bash
```

### Manuelle Installation

1. **Repository klonen:**
```bash
git clone https://github.com/DEIN-USERNAME/DEIN-REPO.git
cd DeviceBox
```

2. **Installationsskript ausführen:**
```bash
bash install.sh
```

Das Installationsskript führt automatisch folgende Schritte aus:
- Installiert alle System-Dependencies (Node.js, PM2, hostapd, dnsmasq, avahi)
- Installiert Node.js Dependencies
- Baut die Next.js App
- Konfiguriert mDNS für `devicebox.local`
- Setup WiFi Access Point
- Startet die Anwendung mit PM2

## Konfiguration

### Umgebungsvariablen

Kopiere `.env.example` zu `.env` und konfiguriere:

```bash
cp .env.example .env
nano .env
```

Wichtige Variablen:
- `GITHUB_WEBHOOK_SECRET` - Secret für GitHub Webhook (für Auto-Deploy)
- `AP_SSID` - SSID für Access Point (Standard: DeviceBox-Setup)
- `AP_PASSWORD` - Passwort für Access Point (Standard: DeviceBox123)
- `PORT` - Port für Next.js Server (Standard: 3000)

### GitHub Webhook Setup

Für Auto-Deploy muss ein GitHub Webhook konfiguriert werden:

1. Gehe zu deinem GitHub Repository → Settings → Webhooks
2. Klicke auf "Add webhook"
3. Konfiguriere:
   - **Payload URL**: `http://DEINE-IP:3000/api/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: Wert aus `.env` Datei (`GITHUB_WEBHOOK_SECRET`)
   - **Events**: Wähle "Just the push event"
4. Klicke auf "Add webhook"

**Hinweis für private Repositories:**
- Der Raspberry Pi muss Zugriff auf das Repository haben
- Entweder über SSH-Keys oder Personal Access Token
- Für SSH: `git remote set-url origin git@github.com:USER/REPO.git`

## Verwendung

### Zugriff auf die Web-UI

Nach der Installation ist DeviceBox erreichbar unter:
- `http://devicebox.local` (im lokalen Netzwerk, ohne Port)
- `http://DEINE-IP` (direkte IP-Adresse, ohne Port)
- `http://devicebox.local:3000` (direkter Zugriff auf Next.js, falls nginx nicht läuft)

### WiFi Access Point

Wenn keine WiFi-Verbindung gefunden wird:
1. DeviceBox startet automatisch einen Access Point
2. SSID: `DeviceBox-Setup` (oder wie in `.env` konfiguriert)
3. Verbinde dich mit dem Access Point
4. Öffne `http://192.168.4.1:3000` im Browser
5. Konfiguriere dein WiFi-Netzwerk über die Web-UI
6. Nach erfolgreicher Verbindung wird der Access Point automatisch gestoppt

### PM2 Management

```bash
# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs devicebox

# Neustarten
pm2 restart devicebox

# Stoppen
pm2 stop devicebox

# Starten
pm2 start devicebox
```

### Manuelles Deployment

```bash
npm run deploy
```

## Projektstruktur

```
DeviceBox/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── wifi/         # WiFi Konfiguration API
│   │   └── webhook/      # GitHub Webhook
│   ├── layout.tsx        # Root Layout
│   └── page.tsx          # Startseite
├── scripts/               # Utility Scripts
│   ├── check-wifi.ts     # WiFi Verbindungsprüfung
│   ├── wifi-manager.ts   # WiFi Management
│   ├── access-point.ts   # Access Point Setup
│   ├── deploy.ts         # Deployment Script
│   ├── github-webhook.ts # Webhook Handler
│   └── *.sh              # Shell Scripts
├── avahi/                 # mDNS Konfiguration
├── systemd/               # Systemd Services
├── ecosystem.config.js    # PM2 Konfiguration
├── install.sh            # Installationsskript
└── package.json          # Node.js Dependencies
```

## Entwicklung

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build erstellen
npm run build

# Production Server starten
npm start
```

### WiFi Status prüfen

```bash
npm run check-wifi
```

## Troubleshooting

### DeviceBox ist nicht erreichbar

1. Prüfe ob PM2 läuft: `pm2 status`
2. Prüfe Logs: `pm2 logs devicebox`
3. Prüfe ob Port 3000 frei ist: `sudo netstat -tulpn | grep 3000`

### mDNS funktioniert nicht

1. Prüfe ob avahi-daemon läuft: `sudo systemctl status avahi-daemon`
2. Prüfe Hostname: `hostname` (sollte "devicebox" sein)
3. Neustart avahi: `sudo systemctl restart avahi-daemon`

### Access Point startet nicht

1. Prüfe ob hostapd läuft: `sudo systemctl status hostapd`
2. Prüfe Konfiguration: `sudo cat /etc/hostapd/hostapd.conf`
3. Prüfe WiFi Interface: `ip link show wlan0`

### GitHub Webhook funktioniert nicht

1. Prüfe GITHUB_WEBHOOK_SECRET in `.env`
2. Prüfe ob URL erreichbar ist (Port Forwarding bei Bedarf)
3. Prüfe GitHub Webhook Logs im Repository Settings
4. Prüfe Server Logs: `pm2 logs devicebox`

## Lizenz

Dieses Projekt ist für den privaten Gebrauch erstellt.

## Support

Bei Problemen bitte ein Issue im GitHub Repository erstellen.

