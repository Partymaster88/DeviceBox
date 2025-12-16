import { NextResponse } from 'next/server';
import { getScannerManager } from '@/lib/scanner';

export async function GET() {
  try {
    const scannerManager = getScannerManager();
    const devices = scannerManager.getDevices();
    
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

