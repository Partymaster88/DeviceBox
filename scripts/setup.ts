#!/usr/bin/env tsx
/**
 * Setup Script - Wird beim ersten Start ausgeführt
 * Prüft WiFi-Verbindung und startet Access Point falls nötig
 */

import { checkWifiConnection } from './check-wifi';
import { startAccessPoint } from './access-point';

async function setup() {
  console.log('DeviceBox Setup wird gestartet...');

  const hasWifi = await checkWifiConnection();

  if (!hasWifi) {
    console.log('Keine WiFi-Verbindung gefunden. Starte Access Point...');
    const apStarted = await startAccessPoint();
    
    if (apStarted) {
      console.log('Access Point gestartet');
      console.log('SSID: DeviceBox-Setup');
      console.log('Verbinde dich mit dem Access Point und öffne http://192.168.4.1:3000/wifi-setup');
    } else {
      console.error('Fehler beim Starten des Access Points');
    }
  } else {
    console.log('WiFi-Verbindung aktiv');
  }
}

if (require.main === module) {
  setup().catch(console.error);
}

