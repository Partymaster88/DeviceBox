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

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled muss ein Boolean sein' },
        { status: 400 }
      );
    }

    const scannerManager = getScannerManager();
    const success = await scannerManager.setEnabled(id, enabled);

    if (success) {
      const device = scannerManager.getDevice(id);
      return NextResponse.json({
        success: true,
        device
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Gerät nicht gefunden oder nicht verbunden' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Geräts:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

