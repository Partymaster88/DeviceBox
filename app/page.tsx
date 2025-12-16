'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [wifiStatus, setWifiStatus] = useState<{ connected: boolean; ssid: string | null } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Prüfe WiFi Status
    fetch('/api/wifi')
      .then(res => res.json())
      .then(data => {
        setWifiStatus(data)
        // Wenn nicht verbunden, leite nach 2 Sekunden zur WiFi-Setup Seite weiter
        if (!data.connected) {
          setTimeout(() => {
            router.push('/wifi-setup')
          }, 2000)
        }
      })
      .catch(() => {
        setWifiStatus({ connected: false, ssid: null })
      })
  }, [router])

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '600px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          DeviceBox
        </h1>
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Raspberry Pi DeviceBox Web Interface
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          {wifiStatus === null ? (
            <p>Lade Status...</p>
          ) : wifiStatus.connected ? (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>✓ WiFi verbunden</p>
              {wifiStatus.ssid && (
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Netzwerk: {wifiStatus.ssid}</p>
              )}
              <p style={{ marginTop: '1rem' }}>System bereit und funktionsfähig</p>
            </div>
          ) : (
            <div>
              <p>Keine WiFi-Verbindung</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Weiterleitung zur WiFi-Konfiguration...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
