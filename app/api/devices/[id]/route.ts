import { NextRequest, NextResponse } from 'next/server';
import { getScannerManager } from '@/lib/scanner';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { enabled } = body;

    console.log(`PUT /api/devices/${id} - enabled: ${enabled}`);

    if (typeof enabled !== 'boolean') {
      console.error('enabled ist kein Boolean:', typeof enabled, enabled);
      return NextResponse.json(
        { success: false, error: 'enabled muss ein Boolean sein' },
        { status: 400 }
      );
    }

    const scannerManager = getScannerManager();
    const deviceBefore = scannerManager.getDevice(id);
    console.log('Gerät vor Update:', deviceBefore);

    if (!deviceBefore) {
      console.error('Gerät nicht gefunden:', id);
      return NextResponse.json(
        { success: false, error: 'Gerät nicht gefunden' },
        { status: 404 }
      );
    }

    const success = await scannerManager.setEnabled(id, enabled);
    console.log('setEnabled Ergebnis:', success);

    if (success) {
      const device = scannerManager.getDevice(id);
      console.log('Gerät nach Update:', device);
      return NextResponse.json({
        success: true,
        device
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Gerät nicht verbunden oder konnte nicht aktiviert werden' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Geräts:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

