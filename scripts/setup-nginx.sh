#!/bin/bash

# Setup nginx Reverse Proxy für DeviceBox
set -e

echo "Konfiguriere nginx Reverse Proxy..."

# Installiere nginx falls nicht vorhanden
if ! command -v nginx &> /dev/null; then
    echo "Installiere nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Erstelle nginx Konfiguration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

sudo cp "$PROJECT_DIR/nginx/devicebox.conf" /etc/nginx/sites-available/devicebox

# Aktiviere Site
if [ ! -L /etc/nginx/sites-enabled/devicebox ]; then
    sudo ln -s /etc/nginx/sites-available/devicebox /etc/nginx/sites-enabled/devicebox
fi

# Entferne default Site falls vorhanden
if [ -L /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Test nginx Konfiguration
sudo nginx -t

# Starte/Neustarte nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "nginx Reverse Proxy konfiguriert"
echo "DeviceBox ist jetzt erreichbar unter: http://devicebox.local (ohne Port)"

