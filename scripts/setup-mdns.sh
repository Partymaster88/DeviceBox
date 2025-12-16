#!/bin/bash

# Setup mDNS/Avahi für devicebox.local
set -e

echo "Konfiguriere mDNS für devicebox.local..."

# Installiere avahi-daemon falls nicht vorhanden
if ! command -v avahi-daemon &> /dev/null; then
    echo "Installiere avahi-daemon..."
    sudo apt-get update
    sudo apt-get install -y avahi-daemon
fi

# Erstelle Avahi Service Definition
sudo mkdir -p /etc/avahi/services
sudo cp "$(dirname "$0")/../avahi/devicebox.service" /etc/avahi/services/devicebox.service

# Setze Hostname zu devicebox
if ! grep -q "devicebox" /etc/hostname; then
    echo "devicebox" | sudo tee /etc/hostname
    sudo hostnamectl set-hostname devicebox
fi

# Füge devicebox.local zu /etc/hosts hinzu
if ! grep -q "devicebox.local" /etc/hosts; then
    echo "127.0.0.1 devicebox.local" | sudo tee -a /etc/hosts
fi

# Starte/Neustarte avahi-daemon
sudo systemctl enable avahi-daemon
sudo systemctl restart avahi-daemon

echo "mDNS Konfiguration abgeschlossen"
echo "DeviceBox ist jetzt unter devicebox.local erreichbar"

