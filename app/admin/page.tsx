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
    const interval = setInterval(loadDevices, 2000) // Aktualisiere alle 2 Sekunden
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
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      if (res.ok) {
        loadDevices()
      }
    } catch (error) {
      console.error('Fehler beim Umschalten des Geräts:', error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          marginBottom: '3rem',
          borderBottom: '2px solid #fff',
          paddingBottom: '1rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '0.05em'
          }}>
            DeviceBox Admin
          </h1>
        </header>

        <main>
          <section>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Geräteliste
            </h2>

            {loading ? (
              <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                Lade Geräte...
              </div>
            ) : devices.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                Keine Geräte gefunden
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem'
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
      background: '#111',
      border: '1px solid #333',
      borderRadius: '4px',
      padding: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '0.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: 0
          }}>
            {device.name}
          </h3>
          <span style={{
            fontSize: '0.875rem',
            color: device.connected ? '#0f0' : '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {device.connected ? 'Verbunden' : 'Nicht verbunden'}
          </span>
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: '#888',
          margin: '0.5rem 0 0 0'
        }}>
          {device.type}
        </p>
        {device.lastScan && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#000',
            border: '1px solid #333',
            borderRadius: '2px'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#888',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Letzter Barcode
            </div>
            <div style={{
              fontSize: '1rem',
              fontFamily: 'monospace',
              color: '#fff'
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
        gap: '0.5rem'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <span style={{
            fontSize: '0.875rem',
            color: device.enabled ? '#fff' : '#888'
          }}>
            {device.enabled ? 'Aktiv' : 'Inaktiv'}
          </span>
          <div
            onClick={() => onToggle(!device.enabled)}
            style={{
              width: '48px',
              height: '24px',
              background: device.enabled ? '#fff' : '#333',
              borderRadius: '12px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              border: '1px solid #666'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              background: device.enabled ? '#000' : '#666',
              borderRadius: '50%',
              position: 'absolute',
              top: '1px',
              left: device.enabled ? '25px' : '1px',
              transition: 'left 0.2s'
            }} />
          </div>
        </label>
      </div>
    </div>
  )
}

