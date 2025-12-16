#!/usr/bin/env tsx
import { execSync } from 'child_process';

/**
 * Prüft ob eine aktive WiFi-Verbindung besteht
 */
export async function checkWifiConnection(): Promise<boolean> {
  try {
    // Prüfe ob wlan0 Interface existiert und eine IP-Adresse hat
    const result = execSync('ip addr show wlan0 2>/dev/null | grep "inet "', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Prüft ob WiFi-Interface verfügbar ist
 */
export function isWifiInterfaceAvailable(): boolean {
  try {
    execSync('ip link show wlan0', { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// CLI Usage
if (require.main === module) {
  checkWifiConnection().then((connected) => {
    console.log(connected ? 'WiFi verbunden' : 'Keine WiFi-Verbindung');
    process.exit(connected ? 0 : 1);
  });
}

