#!/usr/bin/env tsx
/**
 * USB Barcode Scanner Input Listener
 * Liest Tastatur-Eingaben vom Scanner und sendet sie an die API
 */

import { spawn } from 'child_process';
import { execSync } from 'child_process';

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Findet das Input-Device für den Scanner
 */
function findScannerInputDevice(): string | null {
  try {
    // Liste alle Input-Devices
    const devices = execSync('ls /dev/input/event*', { encoding: 'utf-8' }).trim().split('\n');
    
    // Prüfe jedes Device
    for (const device of devices) {
      try {
        // Prüfe ob es ein Keyboard/HID Device ist
        const udevInfo = execSync(`udevadm info ${device} 2>/dev/null | grep -i "keyboard\\|hid"`, { encoding: 'utf-8' });
        if (udevInfo) {
          return device;
        }
      } catch {
        // Ignoriere Fehler
      }
    }
    
    // Fallback: Verwende event0
    return '/dev/input/event0';
  } catch {
    return null;
  }
}

/**
 * Sendet Barcode an die API
 */
async function sendBarcode(barcode: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/scanner/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode })
    });

    if (!response.ok) {
      console.error('Fehler beim Senden des Barcodes:', response.statusText);
    } else {
      console.log('Barcode erfolgreich gesendet:', barcode);
    }
  } catch (error) {
    console.error('Fehler beim Senden des Barcodes:', error);
  }
}

/**
 * Startet den Listener für Tastatur-Eingaben
 * Da USB-Scanner als Tastatur fungieren, lesen wir stdin
 */
function startKeyboardListener(): void {
  console.log('Starte Keyboard-Listener für Barcode-Scanner...');
  console.log('Warte auf Barcode-Scans (Scanner sendet als Tastatur-Eingabe)...');
  
  process.stdin.setEncoding('utf8');
  let buffer = '';
  
  process.stdin.on('data', (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && trimmed.length > 0) {
        console.log('Barcode erkannt:', trimmed);
        sendBarcode(trimmed);
      }
    }
  });

  process.stdin.on('end', () => {
    console.log('Input-Stream beendet');
  });
  
  // Stelle sicher, dass stdin nicht geschlossen wird
  process.stdin.resume();
}

// CLI Usage
if (require.main === module) {
  startKeyboardListener();
}

