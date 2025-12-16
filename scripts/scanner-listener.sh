#!/bin/bash

# USB Barcode Scanner Listener Script
# Liest Barcodes von USB-HID-Geräten und sendet sie an die API

API_URL="${API_URL:-http://localhost:3000}"
INPUT_DEVICE="/dev/input/event0"

# Finde USB HID Input-Geräte
find_input_devices() {
    ls /dev/input/event* 2>/dev/null | head -1
}

# Sendet Barcode an die API
send_barcode() {
    local barcode="$1"
    curl -s -X POST "${API_URL}/api/scanner/scan" \
        -H "Content-Type: application/json" \
        -d "{\"barcode\":\"${barcode}\"}" > /dev/null
}

# Haupt-Loop: Lese von stdin (Scanner als stdin konfiguriert)
# Oder verwende evtest für Input-Events
if [ -t 0 ]; then
    # Wenn kein stdin, verwende evtest
    if command -v evtest &> /dev/null; then
        DEVICE=$(find_input_devices)
        if [ -n "$DEVICE" ]; then
            echo "Lausche auf $DEVICE..."
            evtest "$DEVICE" | while read -r line; do
                # Parse evtest Output (vereinfacht)
                # In der Praxis würde man hier die Events richtig parsen
                echo "$line"
            done
        else
            echo "Kein Input-Device gefunden"
        fi
    else
        echo "evtest nicht installiert. Installiere mit: sudo apt-get install evtest"
    fi
else
    # Lese von stdin
    while IFS= read -r line; do
        trimmed=$(echo "$line" | tr -d '\r\n' | xargs)
        if [ -n "$trimmed" ]; then
            echo "Barcode gescannt: $trimmed"
            send_barcode "$trimmed"
        fi
    done
fi

