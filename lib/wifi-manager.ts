import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const WPA_SUPPLICANT_PATH = '/etc/wpa_supplicant/wpa_supplicant.conf';
const WPA_SUPPLICANT_BACKUP = join(process.cwd(), 'wpa_supplicant.conf.backup');

export interface WifiConfig {
  ssid: string;
  password: string;
}

/**
 * Erstellt Backup der aktuellen wpa_supplicant.conf
 */
function backupWpaSupplicant(): void {
  try {
    if (existsSync(WPA_SUPPLICANT_PATH)) {
      const content = readFileSync(WPA_SUPPLICANT_PATH, 'utf-8');
      writeFileSync(WPA_SUPPLICANT_BACKUP, content);
    }
  } catch (error) {
    console.error('Fehler beim Backup:', error);
  }
}

/**
 * Fügt WiFi-Netzwerk zur wpa_supplicant.conf hinzu
 */
export async function addWifiNetwork(config: WifiConfig): Promise<boolean> {
  try {
    backupWpaSupplicant();

    let wpaContent = '';
    if (existsSync(WPA_SUPPLICANT_PATH)) {
      wpaContent = readFileSync(WPA_SUPPLICANT_PATH, 'utf-8');
    } else {
      wpaContent = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=DE
`;
    }

    // Prüfe ob Netzwerk bereits existiert
    if (wpaContent.includes(`ssid="${config.ssid}"`)) {
      console.log(`Netzwerk ${config.ssid} existiert bereits`);
      return true;
    }

    // Generiere PSK mit wpa_passphrase
    const psk = execSync(
      `wpa_passphrase "${config.ssid}" "${config.password}" | grep -v "#psk" | grep psk`,
      { encoding: 'utf-8' }
    ).trim();

    const networkConfig = `
network={
    ssid="${config.ssid}"
    ${psk}
}
`;

    const newContent = wpaContent + networkConfig;
    writeFileSync(WPA_SUPPLICANT_PATH, newContent);

    // Wende Konfiguration an
    execSync('wpa_cli -i wlan0 reconfigure', { stdio: 'inherit' });

    return true;
  } catch (error) {
    console.error('Fehler beim Hinzufügen des WiFi-Netzwerks:', error);
    return false;
  }
}

/**
 * Verbindet mit einem WiFi-Netzwerk
 */
export async function connectToWifi(config: WifiConfig): Promise<boolean> {
  const success = await addWifiNetwork(config);
  if (success) {
    // Warte auf Verbindung
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Prüfe Verbindung
    try {
      const result = execSync('wpa_cli -i wlan0 status | grep wpa_state', {
        encoding: 'utf-8'
      });
      return result.includes('COMPLETED');
    } catch {
      return false;
    }
  }
  return false;
}

