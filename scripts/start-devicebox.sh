#!/bin/bash

# Start Script für DeviceBox
# Prüft WiFi-Verbindung und startet Access Point falls nötig

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Starte DeviceBox..."

# Prüfe WiFi-Verbindung
cd "$PROJECT_DIR"
if ! npm run check-wifi 2>/dev/null; then
    echo "Keine WiFi-Verbindung gefunden. Starte Access Point..."
    
    # Starte Access Point
    export AP_SSID=${AP_SSID:-"DeviceBox-Setup"}
    export AP_PASSWORD=${AP_PASSWORD:-"DeviceBox123"}
    bash "$SCRIPT_DIR/setup-wifi-ap.sh"
    
    # Starte Access Point Services
    sudo systemctl stop wpa_supplicant 2>/dev/null || true
    sudo ip addr add 192.168.4.1/24 dev wlan0 2>/dev/null || true
    sudo ip link set wlan0 up 2>/dev/null || true
    sudo systemctl start hostapd 2>/dev/null || true
    sudo systemctl start dnsmasq 2>/dev/null || true
    
    echo "Access Point gestartet. SSID: $AP_SSID"
    echo "Verbinde dich mit dem Access Point und öffne http://192.168.4.1:3000/wifi-setup"
else
    echo "WiFi-Verbindung aktiv"
fi

# Starte Next.js mit PM2
cd "$PROJECT_DIR"
if ! pm2 list | grep -q devicebox; then
    echo "Starte PM2..."
    pm2 start ecosystem.config.js
    pm2 save
else
    echo "PM2 läuft bereits"
fi

echo "DeviceBox gestartet"
echo "Erreichbar unter: http://devicebox.local:3000 oder http://$(hostname -I | awk '{print $1}'):3000"

