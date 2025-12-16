import { NextRequest, NextResponse } from 'next/server';
import { getScannerManager } from '@/lib/scanner';

/**
 * Endpoint zum Empfangen von Barcode-Scans
 * Kann von einem externen Service aufgerufen werden, der die USB-Eingabe liest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode } = body;

    if (!barcode || typeof barcode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Barcode erforderlich' },
        { status: 400 }
      );
    }

    const scannerManager = getScannerManager();
    scannerManager.handleScan(barcode);

    return NextResponse.json({
      success: true,
      message: 'Barcode verarbeitet'
    });
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Barcodes:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

