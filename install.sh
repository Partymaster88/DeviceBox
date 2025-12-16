#!/bin/bash

# DeviceBox Installationsskript für Raspberry Pi
# Einzeiler Installation: curl -fsSL https://raw.githubusercontent.com/Partymaster88/DeviceBox/main/install.sh | bash
# Oder: bash <(curl -fsSL https://raw.githubusercontent.com/Partymaster88/DeviceBox/main/install.sh)

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

# Bestimme Installationsverzeichnis
GITHUB_REPO="https://github.com/Partymaster88/DeviceBox.git"
INSTALL_DIR="$HOME/devicebox"

# Prüfe ob Git installiert ist
if ! command -v git &> /dev/null; then
    echo "Git ist nicht installiert. Installiere Git..."
    sudo apt-get update
    sudo apt-get install -y git
fi

# Prüfe ob Repository bereits existiert
if [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/package.json" ]; then
    # Repository existiert bereits
    SCRIPT_DIR="$INSTALL_DIR"
    echo "Verwende vorhandenes Repository in: $SCRIPT_DIR"
    cd "$INSTALL_DIR"
    echo "Aktualisiere Repository..."
    git pull || true
else
    # Klone Repository
    echo "Klone Repository nach $INSTALL_DIR..."
    if [ -d "$INSTALL_DIR" ]; then
        rm -rf "$INSTALL_DIR"
    fi
    git clone "$GITHUB_REPO" "$INSTALL_DIR"
    SCRIPT_DIR="$INSTALL_DIR"
    cd "$SCRIPT_DIR"
fi

# Stelle sicher, dass wir im richtigen Verzeichnis sind
cd "$SCRIPT_DIR"

# Prüfe ob das Repository korrekt geklont wurde
if [ ! -f "$SCRIPT_DIR/package.json" ] || [ ! -d "$SCRIPT_DIR/scripts" ]; then
    echo "Fehler: Repository wurde nicht korrekt geklont oder ist unvollständig"
    echo "Bitte manuell klonen: git clone $GITHUB_REPO $INSTALL_DIR"
    exit 1
fi

echo "Verwende Repository in: $SCRIPT_DIR"
echo ""

# Installiere System-Dependencies
echo "Installiere System-Dependencies..."
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

# Setup nginx Reverse Proxy
echo ""
echo "Konfiguriere nginx Reverse Proxy..."
bash "$SCRIPT_DIR/scripts/setup-nginx.sh"

# Setup WiFi Access Point (falls nötig)
echo ""
echo "Konfiguriere WiFi Access Point..."
bash "$SCRIPT_DIR/scripts/setup-wifi-ap.sh"

# Erstelle .env Datei falls nicht vorhanden
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo ""
    echo "Erstelle .env Datei..."
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        echo "Bitte konfiguriere GITHUB_WEBHOOK_SECRET in $SCRIPT_DIR/.env"
    else
        echo "Warnung: .env.example nicht gefunden"
    fi
fi

# Erstelle logs Verzeichnis
mkdir -p "$SCRIPT_DIR/logs"

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
echo "Installationsverzeichnis: $SCRIPT_DIR"
echo ""
echo "DeviceBox ist jetzt erreichbar unter:"
echo "  - http://devicebox.local (ohne Port)"
echo "  - http://$(hostname -I | awk '{print $1}') (ohne Port)"
echo ""
echo "Admin-Interface:"
echo "  - http://devicebox.local/admin"
echo ""
echo "GitHub Webhook Setup:"
echo "  1. Gehe zu deinem GitHub Repository Settings > Webhooks"
echo "  2. Füge einen neuen Webhook hinzu:"
echo "     URL: http://$(hostname -I | awk '{print $1}'):3000/api/webhook/github"
echo "     Content type: application/json"
echo "     Secret: (aus $SCRIPT_DIR/.env Datei: GITHUB_WEBHOOK_SECRET)"
echo "     Events: Just the push event"
echo ""
echo "PM2 Befehle:"
echo "  pm2 status          - Status anzeigen"
echo "  pm2 logs devicebox  - Logs anzeigen"
echo "  pm2 restart devicebox - Neustarten"
echo ""
echo "Wechsel ins Installationsverzeichnis:"
echo "  cd $SCRIPT_DIR"
echo ""
