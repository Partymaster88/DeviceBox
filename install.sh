#!/bin/bash

# DeviceBox Installationsskript für Raspberry Pi
# Einzeiler Installation: curl -fsSL https://raw.githubusercontent.com/USER/REPO/main/install.sh | bash
# Oder: bash <(curl -fsSL https://raw.githubusercontent.com/USER/REPO/main/install.sh)

set -e

echo "=========================================="
echo "DeviceBox Installation für Raspberry Pi"
echo "=========================================="

# Prüfe ob wir auf einem Raspberry Pi sind
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "Warnung: Dieses Script ist für Raspberry Pi optimiert"
    read -p "Fortfahren? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Installiere System-Dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/scripts/install-dependencies.sh"

# Installiere Node.js Dependencies
echo ""
echo "Installiere Node.js Dependencies..."
cd "$SCRIPT_DIR"
npm install

# Baue Next.js App
echo ""
echo "Baue Next.js App..."
npm run build

# Setup mDNS
echo ""
echo "Konfiguriere mDNS..."
bash "$SCRIPT_DIR/scripts/setup-mdns.sh"

# Setup WiFi Access Point (falls nötig)
echo ""
echo "Konfiguriere WiFi Access Point..."
bash "$SCRIPT_DIR/scripts/setup-wifi-ap.sh"

# Erstelle .env Datei falls nicht vorhanden
if [ ! -f .env ]; then
    echo ""
    echo "Erstelle .env Datei..."
    cp .env.example .env
    echo "Bitte konfiguriere GITHUB_WEBHOOK_SECRET in .env"
fi

# Erstelle logs Verzeichnis
mkdir -p logs

# Setup PM2
echo ""
echo "Konfiguriere PM2..."
pm2 startup systemd -u $USER --hp /home/$USER || true
pm2 save || true

# Starte DeviceBox
echo ""
echo "Starte DeviceBox..."
bash "$SCRIPT_DIR/scripts/start-devicebox.sh"

echo ""
echo "=========================================="
echo "Installation abgeschlossen!"
echo "=========================================="
echo ""
echo "DeviceBox ist jetzt erreichbar unter:"
echo "  - http://devicebox.local:3000"
echo "  - http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "GitHub Webhook Setup:"
echo "  1. Gehe zu deinem GitHub Repository Settings > Webhooks"
echo "  2. Füge einen neuen Webhook hinzu:"
echo "     URL: http://$(hostname -I | awk '{print $1}'):3000/api/webhook/github"
echo "     Content type: application/json"
echo "     Secret: (aus .env Datei: GITHUB_WEBHOOK_SECRET)"
echo "     Events: Just the push event"
echo ""
echo "PM2 Befehle:"
echo "  pm2 status          - Status anzeigen"
echo "  pm2 logs devicebox  - Logs anzeigen"
echo "  pm2 restart devicebox - Neustarten"
echo ""

