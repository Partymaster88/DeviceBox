# Datalogic Touch 65 Scanner Setup

## Übersicht

Das DeviceBox-System unterstützt den Datalogic Touch 65 USB-Barcode-Scanner. Der Scanner wird automatisch erkannt und kann über das Admin-Interface aktiviert/deaktiviert werden.

## Funktionen

- ✅ Automatische Geräteerkennung
- ✅ Aktivieren/Deaktivieren über Web-Interface
- ✅ USB-Power-Control (Stromversorgung ein/aus)
- ✅ Anzeige des letzten gescannten Barcodes
- ✅ Schwarz-Weiß Admin-Interface

## Installation

Die benötigten Tools werden automatisch beim Installationsskript installiert:

- `uhubctl` - USB-Power-Control
- `evtest` - Input-Event-Testing
- `usbutils` - USB-Tools (lsusb)

## Verwendung

### 1. Scanner anschließen

Schließe den Datalogic Touch 65 Scanner an einen USB-Port des Raspberry Pi an.

### 2. Admin-Interface öffnen

Öffne im Browser:
```
http://devicebox.local:3000/admin
```

### 3. Scanner aktivieren

1. Der Scanner sollte automatisch in der Geräteliste erscheinen
2. Aktiviere den Toggle-Switch, um den Scanner zu aktivieren
3. Beim Aktivieren wird die USB-Stromversorgung eingeschaltet
4. Beim Deaktivieren wird die USB-Stromversorgung ausgeschaltet

### 4. Barcodes scannen

Sobald der Scanner aktiviert ist, können Barcodes gescannt werden. Der letzte gescannte Barcode wird in der UI angezeigt.

## USB-Power-Control

Das System verwendet `uhubctl` zur Steuerung der USB-Stromversorgung. Nicht alle USB-Hubs unterstützen Power-Control. Falls die Power-Control nicht funktioniert:

1. Prüfe ob `uhubctl` installiert ist: `which uhubctl`
2. Prüfe unterstützte Hubs: `uhubctl`
3. Der Scanner wird trotzdem funktionieren, nur die Power-Control ist dann nicht verfügbar

## Barcode-Listener

Der Barcode-Scanner sendet Tastatur-Events über USB HID. Um Barcodes zu empfangen, gibt es mehrere Optionen:

### Option 1: Automatisch (empfohlen)

Der Scanner sendet Barcodes direkt als Tastatur-Eingabe. Diese werden automatisch erkannt, wenn der Scanner aktiviert ist.

### Option 2: Manueller Listener

Falls automatische Erkennung nicht funktioniert, kann ein manueller Listener gestartet werden:

```bash
# Scanner-Listener starten
npm run scanner:listen
```

## Troubleshooting

### Scanner wird nicht erkannt

1. Prüfe USB-Verbindung: `lsusb | grep -i datalogic`
2. Prüfe ob Gerät als Input-Device erkannt wird: `ls /dev/input/`
3. Prüfe Logs: `pm2 logs devicebox`

### USB-Power-Control funktioniert nicht

1. Prüfe ob `uhubctl` installiert ist
2. Prüfe unterstützte Hubs: `uhubctl`
3. Nicht alle USB-Hubs unterstützen Power-Control
4. Der Scanner funktioniert trotzdem, nur ohne Power-Control

### Barcodes werden nicht erkannt

1. Prüfe ob Scanner aktiviert ist (Toggle in UI)
2. Prüfe ob Scanner als Input-Device erkannt wird
3. Teste Scanner mit: `evtest /dev/input/event0` (oder entsprechendes Event-Device)

## Technische Details

### Geräteerkennung

Das System erkennt den Scanner über:
- USB Vendor ID: `05f9` (Datalogic)
- USB Device Name: Enthält "Datalogic"

### USB-Port-Erkennung

Der USB-Port wird automatisch erkannt über:
- `lsusb -t` - USB-Baum-Struktur
- `uhubctl` - USB-Hub-Informationen

### Barcode-Verarbeitung

Barcodes werden als Tastatur-Events empfangen und an die API gesendet:
- Endpoint: `/api/scanner/scan`
- Format: `{ "barcode": "1234567890" }`

## API-Endpoints

### GET /api/devices

Gibt alle erkannten Geräte zurück.

**Response:**
```json
{
  "success": true,
  "devices": [
    {
      "id": "datalogic-touch65-1",
      "name": "Datalogic Touch 65",
      "type": "USB Barcode Scanner",
      "connected": true,
      "enabled": true,
      "lastScan": "1234567890",
      "usbPort": "1-1.2"
    }
  ]
}
```

### PUT /api/devices/:id

Aktiviert/Deaktiviert ein Gerät.

**Request:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "device": { ... }
}
```

### POST /api/scanner/scan

Empfängt einen gescannten Barcode.

**Request:**
```json
{
  "barcode": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Barcode verarbeitet"
}
```

