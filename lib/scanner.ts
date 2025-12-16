import { execSync } from 'child_process';
import { EventEmitter } from 'events';

export interface ScannerDevice {
  id: string;
  name: string;
  type: string;
  vendorId?: string;
  productId?: string;
  usbPort?: string;
  connected: boolean;
  enabled: boolean;
  lastScan?: string;
}

/**
 * Datalogic Touch 65 Scanner Manager
 * Der Scanner wird als USB HID (Human Interface Device) erkannt
 */
export class ScannerManager extends EventEmitter {
  private devices: Map<string, ScannerDevice> = new Map();
  private scanBuffer: string = '';
  private scanTimeout?: NodeJS.Timeout;

  constructor() {
    super();
    console.log('ScannerManager initialisiert');
    this.startScanListener();
  }
  
  /**
   * Öffentliche Methode zum manuellen Auslösen der Geräteerkennung
   */
  public detectDevices(): void {
    console.log('Manuelle Geräteerkennung ausgelöst');
    this.detectDevicesPrivate();
  }
  
  /**
   * Private Methode für Geräteerkennung
   */
  private detectDevicesPrivate(): void {

  /**
   * Startet den Listener für Barcode-Scans
   * USB-Barcode-Scanner emulieren eine Tastatur, daher lesen wir /dev/input
   */
  private startScanListener(): void {
    // Initiale Erkennung
    this.detectDevicesPrivate();
    
    // Prüfe auf USB-Geräte regelmäßig
    setInterval(() => {
      this.detectDevicesPrivate();
    }, 2000);
  }

  /**
   * Erkennt angeschlossene Scanner-Geräte (private)
   */
  private detectDevicesPrivate(): void {
    try {
      // Prüfe auf Datalogic Touch 65 (USB HID)
      // Vendor ID für Datalogic: 0x05f9 oder 0x05f9
      const usbDevices = execSync('lsusb', { encoding: 'utf-8' });
      
      // Debug: Log USB-Geräte
      console.log('USB-Geräte:', usbDevices);
      
      // Suche nach Datalogic/PSC Scanning Geräten
      // Vendor ID: 05f9 (PSC Scanning, Inc. / Datalogic)
      // Product ID: 2214 (Handheld Barcode Scanner)
      const scannerPatterns = [
        /05f9:2214/i,  // Spezifische Product ID zuerst
        /PSC Scanning/i,
        /Datalogic/i,
        /05f9/i
      ];
      
      const hasScanner = scannerPatterns.some(pattern => {
        const match = pattern.test(usbDevices);
        if (match) {
          console.log('Scanner gefunden mit Pattern:', pattern);
        }
        return match;
      });
      
      console.log('Scanner erkannt:', hasScanner);
      
      if (hasScanner) {
        const deviceId = 'datalogic-touch65-1';
        
        if (!this.devices.has(deviceId)) {
          // Finde USB-Port für Power-Control
          const usbPort = this.findUsbPort();
          
          // Extrahiere genauen Gerätenamen aus lsusb
          const deviceMatch = usbDevices.match(/05f9:2214\s+(.+)/);
          const deviceName = deviceMatch ? deviceMatch[1].trim() : 'Datalogic Touch 65';
          
          const device: ScannerDevice = {
            id: deviceId,
            name: deviceName,
            type: 'USB Barcode Scanner',
            vendorId: '05f9',
            productId: '2214',
            connected: true,
            enabled: false,
            usbPort: usbPort
          };
          
          this.devices.set(deviceId, device);
          this.emit('device-connected', device);
        } else {
          // Update connection status
          const device = this.devices.get(deviceId)!;
          if (!device.connected) {
            device.connected = true;
            this.emit('device-connected', device);
          }
        }
      } else {
        // Gerät nicht mehr verbunden
        this.devices.forEach((device, id) => {
          if (device.connected) {
            device.connected = false;
            this.emit('device-disconnected', device);
          }
        });
      }
    } catch (error) {
      console.error('Fehler bei Geräteerkennung:', error);
    }
  }

  /**
   * Findet den USB-Port für ein Gerät (für Power-Control)
   */
  private findUsbPort(): string | undefined {
    try {
      // uhubctl verwendet Bus:Port Format
      // Beispiel: 1-1.2 oder einfach Bus-Port
      const usbTree = execSync('lsusb -t', { encoding: 'utf-8' });
      const lines = usbTree.split('\n');
      
      // Suche nach Scanner-Gerät (05f9:2214)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('05f9:2214') || lines[i].includes('PSC Scanning') || lines[i].includes('Datalogic') || lines[i].includes('05f9')) {
          // Extrahiere Bus und Port
          // Format: /:  Bus 01.Port 1: Dev 1, Class=root_hub, Driver=...
          const busMatch = lines[i].match(/Bus (\d+)/);
          const portMatch = lines[i].match(/Port (\d+\.?\d*)/);
          
          if (busMatch && portMatch) {
            return `${busMatch[1]}-${portMatch[1]}`;
          }
          
          // Alternative: Suche in übergeordneten Zeilen
          for (let j = i - 1; j >= 0; j--) {
            const busMatch2 = lines[j].match(/Bus (\d+)/);
            const portMatch2 = lines[j].match(/Port (\d+\.?\d*)/);
            if (busMatch2 && portMatch2) {
              return `${busMatch2[1]}-${portMatch2[1]}`;
            }
          }
        }
      }
      
      // Fallback: Verwende ersten USB-Hub
      const hubctlList = execSync('uhubctl 2>/dev/null | head -20', { encoding: 'utf-8' });
      const hubMatch = hubctlList.match(/Current status for hub (\d+)/);
      if (hubMatch) {
        return `${hubMatch[1]}-1`; // Erster Port des ersten Hubs
      }
    } catch (error) {
      console.error('Fehler beim Finden des USB-Ports:', error);
    }
    return undefined;
  }

  /**
   * Aktiviert/Deaktiviert einen Scanner
   */
  async setEnabled(deviceId: string, enabled: boolean): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || !device.connected) {
      return false;
    }

    try {
      if (device.usbPort) {
        // Kontrolliere USB-Power mit uhubctl
        // uhubctl -l <hub> -p <port> -a <0|1> (0=off, 1=on)
        const [bus, port] = device.usbPort.split('-');
        
        try {
          execSync(`uhubctl -l ${bus} -p ${port} -a ${enabled ? 1 : 0}`, {
            stdio: 'pipe'
          });
          console.log(`USB-Port ${device.usbPort} ${enabled ? 'aktiviert' : 'deaktiviert'}`);
        } catch (error) {
          console.warn(`Konnte USB-Port ${device.usbPort} nicht steuern. Möglicherweise unterstützt der Hub keine Power-Control.`);
          // Nicht kritisch, fortfahren
        }
      }

      device.enabled = enabled;
      this.emit('device-updated', device);
      return true;
    } catch (error) {
      console.error('Fehler beim Umschalten des USB-Ports:', error);
      // Fallback: Nur Status ändern, auch wenn USB-Control fehlschlägt
      device.enabled = enabled;
      this.emit('device-updated', device);
      return true;
    }
  }

  /**
   * Gibt alle erkannten Geräte zurück
   */
  getDevices(): ScannerDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Gibt ein spezifisches Gerät zurück
   */
  getDevice(deviceId: string): ScannerDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Verarbeitet einen gescannten Barcode
   */
  handleScan(barcode: string): void {
    // Finde aktiven Scanner
    const activeDevice = Array.from(this.devices.values())
      .find(d => d.enabled && d.connected);

    if (activeDevice) {
      activeDevice.lastScan = barcode;
      this.emit('scan', activeDevice, barcode);
      this.emit('device-updated', activeDevice);
    }
  }
}

// Singleton-Instanz
let scannerManagerInstance: ScannerManager | null = null;

export function getScannerManager(): ScannerManager {
  if (!scannerManagerInstance) {
    scannerManagerInstance = new ScannerManager();
  }
  return scannerManagerInstance;
}

