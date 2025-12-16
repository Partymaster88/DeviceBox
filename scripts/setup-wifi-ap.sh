#!/bin/bash

# Setup WiFi Access Point für DeviceBox
# Dieses Script konfiguriert hostapd und dnsmasq für den Access Point

set -e

AP_SSID=${AP_SSID:-"DeviceBox-Setup"}
AP_PASSWORD=${AP_PASSWORD:-"DeviceBox123"}
AP_INTERFACE="wlan0"

echo "Konfiguriere Access Point: $AP_SSID"

# Installiere benötigte Pakete falls nicht vorhanden
if ! command -v hostapd &> /dev/null; then
    echo "Installiere hostapd..."
    sudo apt-get update
    sudo apt-get install -y hostapd dnsmasq
fi

# Erstelle hostapd Konfiguration
sudo tee /etc/hostapd/hostapd.conf > /dev/null <<EOF
interface=${AP_INTERFACE}
driver=nl80211
ssid=${AP_SSID}
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=${AP_PASSWORD}
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
EOF

# Konfiguriere hostapd Daemon
sudo sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd

# Erstelle dnsmasq Konfiguration
sudo tee /etc/dnsmasq.conf > /dev/null <<EOF
interface=${AP_INTERFACE}
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
dhcp-option=3,192.168.4.1
dhcp-option=6,192.168.4.1
server=8.8.8.8
log-queries
log-dhcp
listen-address=127.0.0.1
listen-address=192.168.4.1
EOF

# Konfiguriere statische IP in dhcpcd.conf
if ! grep -q "interface ${AP_INTERFACE}" /etc/dhcpcd.conf; then
    sudo tee -a /etc/dhcpcd.conf > /dev/null <<EOF

# DeviceBox Access Point Konfiguration
interface ${AP_INTERFACE}
static ip_address=192.168.4.1/24
nohook wpa_supplicant
EOF
fi

# Aktiviere IP Forwarding permanent
if ! grep -q "net.ipv4.ip_forward=1" /etc/sysctl.conf; then
    echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
fi

# Konfiguriere iptables für NAT
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"

# Lade iptables beim Booten
if [ ! -f /etc/rc.local ]; then
    sudo tee /etc/rc.local > /dev/null <<'EOF'
#!/bin/sh -e
iptables-restore < /etc/iptables.ipv4.nat
exit 0
EOF
    sudo chmod +x /etc/rc.local
fi

echo "Access Point Konfiguration abgeschlossen"
echo "SSID: $AP_SSID"
echo "Passwort: $AP_PASSWORD"

