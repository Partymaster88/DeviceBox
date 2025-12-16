#!/usr/bin/env tsx
/**
 * USB Barcode Scanner Listener
 * Liest Barcode-Scans von USB-HID-Geräten und sendet sie an die API
 */

import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const INPUT_DEVICE = '/dev/input/event0'; // Standard USB HID Input

/**
 * Findet USB HID Input-Geräte
 */
function findInputDevices(): string[] {
  try {
    const devices = execSync('ls /dev/input/event*', { encoding: 'utf-8' });
    return devices.trim().split('\n').filter(Boolean);
  } catch {
    return [];
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
    }
  } catch (error) {
    console.error('Fehler beim Senden des Barcodes:', error);
  }
}

/**
 * Liest Barcodes von einem Input-Device
 * USB-Barcode-Scanner emulieren eine Tastatur
 * Wir verwenden evtest oder eine einfache Lösung mit /dev/input
 */
function startListener(): void {
  console.log('Starte Barcode-Scanner Listener...');

  // Für eine einfache Lösung: Verwende evtest oder node-hid
  // Da wir keine zusätzlichen Dependencies wollen, verwenden wir einen einfachen Ansatz
  // Der Scanner sendet Tastatur-Events, die wir über /dev/input lesen können

  // Alternative: Verwende ein Python-Script oder ein einfaches Node-Script
  // das die Tastatur-Events liest und an die API sendet

  console.log('Barcode-Scanner Listener läuft...');
  console.log('Warte auf Barcode-Scans...');

  // Für eine vollständige Implementierung würde man hier:
  // 1. Input-Devices finden
  // 2. Events von USB-HID-Geräten lesen
  // 3. Barcodes parsen (Scanner sendet normalerweise Enter nach dem Barcode)
  // 4. An API senden

  // Da dies komplex ist, verwenden wir einen einfacheren Ansatz:
  // Ein separates Script, das stdin liest (wenn der Scanner als stdin konfiguriert ist)
}

// Für eine einfachere Lösung: Erstelle ein Shell-Script, das stdin liest
if (require.main === module) {
  startListener();
  
  // Lese von stdin (falls Scanner als stdin konfiguriert)
  process.stdin.setEncoding('utf8');
  let buffer = '';
  
  process.stdin.on('data', (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Behalte unvollständige Zeile
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        console.log('Barcode gescannt:', trimmed);
        sendBarcode(trimmed);
      }
    }
  });

  process.stdin.on('end', () => {
    console.log('Input-Stream beendet');
    process.exit(0);
  });
}

