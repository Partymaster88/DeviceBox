'use client'

import { useEffect, useState } from 'react'

interface Device {
  id: string
  name: string
  type: string
  connected: boolean
  enabled: boolean
  lastScan?: string
}

export default function AdminPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDevices()
    const interval = setInterval(loadDevices, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadDevices = async () => {
    try {
      const res = await fetch('/api/devices')
      const data = await res.json()
      setDevices(data.devices || [])
    } catch (error) {
      console.error('Fehler beim Laden der Geräte:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDevice = async (deviceId: string, enabled: boolean) => {
    try {
      console.log(`Toggle Device: ${deviceId}, enabled: ${enabled}`);
      
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (res.ok) {
        loadDevices()
      } else {
        console.error('API Fehler:', data);
        alert(`Fehler: ${data.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Fehler beim Umschalten des Geräts:', error)
      alert(`Fehler beim Umschalten: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#000000',
      padding: 0,
      margin: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Header */}
        <header style={{
          marginBottom: '4rem',
          paddingBottom: '2rem',
          borderBottom: '2px solid #000000'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}>
            DeviceBox Admin
          </h1>
          <p style={{
            fontSize: '1rem',
            marginTop: '0.5rem',
            color: '#666666',
            fontWeight: '400'
          }}>
            Geräteverwaltung und Scanner-Kontrolle
          </p>
        </header>

        {/* Main Content */}
        <main>
          <section>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Geräteliste
              </h2>
              <div style={{
                fontSize: '0.875rem',
                color: '#666666'
              }}>
                {devices.length} {devices.length === 1 ? 'Gerät' : 'Geräte'}
              </div>
            </div>

            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#666666'
              }}>
                <div style={{ fontSize: '1rem' }}>Lade Geräte...</div>
              </div>
            ) : devices.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#666666',
                border: '2px dashed #cccccc',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Keine Geräte gefunden</div>
                <div style={{ fontSize: '0.875rem', color: '#999999' }}>
                  Bitte verbinde ein unterstütztes Gerät über USB
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1.5rem'
              }}>
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onToggle={(enabled) => toggleDevice(device.id, enabled)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function DeviceCard({ device, onToggle }: { device: Device; onToggle: (enabled: boolean) => void }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '2px solid #000000',
      borderRadius: '0',
      padding: '2rem',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '2rem',
      alignItems: 'start',
      transition: 'all 0.2s ease',
      boxShadow: '0 0 0 0 #000000'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '4px 4px 0 0 #000000'
      e.currentTarget.style.transform = 'translate(-2px, -2px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 0 0 0 #000000'
      e.currentTarget.style.transform = 'translate(0, 0)'
    }}
    >
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {device.name}
          </h3>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '0.25rem 0.75rem',
            background: device.connected ? '#000000' : '#cccccc',
            color: device.connected ? '#ffffff' : '#666666',
            borderRadius: '0'
          }}>
            {device.connected ? 'Verbunden' : 'Getrennt'}
          </span>
        </div>
        
        <p style={{
          fontSize: '0.875rem',
          color: '#666666',
          margin: '0 0 1.5rem 0',
          fontWeight: '400'
        }}>
          {device.type}
        </p>

        {device.lastScan && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f5f5f5',
            border: '1px solid #000000',
            borderRadius: '0'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#666666',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '600'
            }}>
              Letzter Barcode
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontFamily: 'monospace',
              color: '#000000',
              fontWeight: '600',
              letterSpacing: '0.05em'
            }}>
              {device.lastScan}
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: device.enabled ? '#000000' : '#999999',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {device.enabled ? 'Aktiv' : 'Inaktiv'}
          </span>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <div
              onClick={() => onToggle(!device.enabled)}
              style={{
                width: '60px',
                height: '32px',
                background: device.enabled ? '#000000' : '#e0e0e0',
                borderRadius: '0',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
                border: '2px solid #000000'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                background: '#ffffff',
                borderRadius: '0',
                position: 'absolute',
                top: '2px',
                left: device.enabled ? '30px' : '2px',
                transition: 'left 0.2s',
                border: '2px solid #000000',
                boxSizing: 'border-box'
              }} />
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
