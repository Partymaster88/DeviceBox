#!/bin/bash

# Installiert alle System-Dependencies für DeviceBox
set -e

echo "Installiere System-Dependencies für DeviceBox..."

# Update System
sudo apt-get update
sudo apt-get upgrade -y

# Installiere Node.js (falls nicht vorhanden)
if ! command -v node &> /dev/null; then
    echo "Installiere Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Installiere Git (falls nicht vorhanden)
if ! command -v git &> /dev/null; then
    echo "Installiere Git..."
    sudo apt-get install -y git
fi

# Installiere PM2 global
if ! command -v pm2 &> /dev/null; then
    echo "Installiere PM2..."
    sudo npm install -g pm2
fi

# Installiere WiFi Access Point Tools
echo "Installiere WiFi Access Point Tools..."
sudo apt-get install -y hostapd dnsmasq

# Installiere mDNS
echo "Installiere Avahi (mDNS)..."
sudo apt-get install -y avahi-daemon

# Installiere weitere benötigte Tools (nftables statt iptables für Ubuntu 20.04+)
sudo apt-get install -y nftables

# Installiere USB-Tools für Scanner und Power-Control
echo "Installiere USB-Tools..."
sudo apt-get install -y uhubctl evtest usbutils

echo "System-Dependencies Installation abgeschlossen"
echo "Node.js Version: $(node --version)"
echo "npm Version: $(npm --version)"
echo "PM2 Version: $(pm2 --version)"

