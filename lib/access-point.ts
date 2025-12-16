import { execSync } from 'child_process';

const AP_INTERFACE = 'wlan0';

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

