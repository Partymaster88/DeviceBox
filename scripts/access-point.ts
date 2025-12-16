#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

const HOSTAPD_CONFIG_PATH = '/etc/hostapd/hostapd.conf';
const DNSMASQ_CONFIG_PATH = '/etc/dnsmasq.conf';
const DNSMASQ_DHCPCD_CONF = '/etc/dhcpcd.conf';

const AP_SSID = process.env.AP_SSID || 'DeviceBox-Setup';
const AP_PASSWORD = process.env.AP_PASSWORD || 'DeviceBox123';
const AP_CHANNEL = '7';
const AP_INTERFACE = 'wlan0';

/**
 * Erstellt hostapd Konfiguration für Access Point
 */
export function createHostapdConfig(): void {
  const config = `interface=${AP_INTERFACE}
driver=nl80211
ssid=${AP_SSID}
hw_mode=g
channel=${AP_CHANNEL}
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=${AP_PASSWORD}
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
`;

  writeFileSync(HOSTAPD_CONFIG_PATH, config);
  console.log('hostapd Konfiguration erstellt');
}

/**
 * Erstellt dnsmasq Konfiguration für DHCP
 */
export function createDnsmasqConfig(): void {
  const config = `interface=${AP_INTERFACE}
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
dhcp-option=3,192.168.4.1
dhcp-option=6,192.168.4.1
server=8.8.8.8
log-queries
log-dhcp
listen-address=127.0.0.1
listen-address=192.168.4.1
`;

  writeFileSync(DNSMASQ_CONFIG_PATH, config);
  console.log('dnsmasq Konfiguration erstellt');
}

/**
 * Konfiguriert statische IP für Access Point
 */
export function configureStaticIP(): void {
  try {
    // Backup der aktuellen dhcpcd.conf
    if (existsSync(DNSMASQ_DHCPCD_CONF)) {
      execSync(`cp ${DNSMASQ_DHCPCD_CONF} ${DNSMASQ_DHCPCD_CONF}.backup`);
    }

    // Füge statische IP Konfiguration hinzu
    const staticConfig = `
# DeviceBox Access Point Konfiguration
interface ${AP_INTERFACE}
static ip_address=192.168.4.1/24
nohook wpa_supplicant
`;

    execSync(`echo "${staticConfig}" >> ${DNSMASQ_DHCPCD_CONF}`);
    console.log('Statische IP konfiguriert');
  } catch (error) {
    console.error('Fehler bei statischer IP Konfiguration:', error);
  }
}

/**
 * Startet Access Point
 */
export async function startAccessPoint(): Promise<boolean> {
  try {
    // Stoppe wpa_supplicant falls aktiv
    try {
      execSync('systemctl stop wpa_supplicant', { stdio: 'pipe' });
    } catch {}

    // Konfiguriere Interface
    configureStaticIP();
    
    // Erstelle Konfigurationsdateien
    createHostapdConfig();
    createDnsmasqConfig();

    // Setze IP-Adresse
    execSync(`ip addr add 192.168.4.1/24 dev ${AP_INTERFACE}`, { stdio: 'inherit' });
    execSync(`ip link set ${AP_INTERFACE} up`, { stdio: 'inherit' });

    // Starte Services
    execSync('systemctl start hostapd', { stdio: 'inherit' });
    execSync('systemctl start dnsmasq', { stdio: 'inherit' });

    // Aktiviere IP Forwarding
    execSync('sysctl -w net.ipv4.ip_forward=1', { stdio: 'inherit' });
    execSync('iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE', { stdio: 'inherit' });

    console.log('Access Point gestartet');
    return true;
  } catch (error) {
    console.error('Fehler beim Starten des Access Points:', error);
    return false;
  }
}

/**
 * Stoppt Access Point
 */
export async function stopAccessPoint(): Promise<boolean> {
  try {
    // Stoppe Services
    execSync('systemctl stop hostapd', { stdio: 'pipe' });
    execSync('systemctl stop dnsmasq', { stdio: 'pipe' });

    // Entferne statische IP
    execSync(`ip addr del 192.168.4.1/24 dev ${AP_INTERFACE}`, { stdio: 'pipe' });

    // Starte wpa_supplicant wieder
    execSync('systemctl start wpa_supplicant', { stdio: 'pipe' });

    console.log('Access Point gestoppt');
    return true;
  } catch (error) {
    console.error('Fehler beim Stoppen des Access Points:', error);
    return false;
  }
}

