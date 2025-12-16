import { NextRequest, NextResponse } from 'next/server';
import { connectToWifi } from '../../../scripts/wifi-manager';
import { stopAccessPoint } from '../../../scripts/access-point';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ssid, password } = body;

    if (!ssid || !password) {
      return NextResponse.json(
        { error: 'SSID und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    // Verbinde mit WiFi
    const success = await connectToWifi({ ssid, password });

    if (success) {
      // Stoppe Access Point nach erfolgreicher Verbindung
      await stopAccessPoint();
      
      return NextResponse.json({
        success: true,
        message: 'WiFi-Verbindung erfolgreich hergestellt'
      });
    } else {
      return NextResponse.json(
        { error: 'WiFi-Verbindung fehlgeschlagen' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('WiFi API Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { execSync } = require('child_process');
    
    // Prüfe WiFi Status
    const status = execSync('wpa_cli -i wlan0 status', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    const lines = status.split('\n');
    const state = lines.find((l: string) => l.startsWith('wpa_state'))?.split('=')[1];
    const ssid = lines.find((l: string) => l.startsWith('ssid'))?.split('=')[1];

    return NextResponse.json({
      connected: state === 'COMPLETED',
      ssid: ssid || null,
      state: state || 'UNKNOWN'
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      ssid: null,
      state: 'ERROR'
    });
  }
}

