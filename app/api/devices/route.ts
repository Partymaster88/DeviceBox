import { NextResponse } from 'next/server';
import { getScannerManager } from '@/lib/scanner';

export async function GET() {
  try {
    const scannerManager = getScannerManager();
    
    // Erzwinge Geräteerkennung (wird intern geprüft ob Build)
    scannerManager.detectDevices();
    
    const devices = scannerManager.getDevices();
    
    // Logging zur Laufzeit (NEXT_PHASE ist nur während des Builds gesetzt)
    console.log('API /devices aufgerufen, gefundene Geräte:', devices.length);
    if (devices.length > 0) {
      console.log('Geräte:', JSON.stringify(devices, null, 2));
    }
    
    return NextResponse.json({
      success: true,
      devices
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Geräte:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler', devices: [] },
      { status: 500 }
    );
  }
}

