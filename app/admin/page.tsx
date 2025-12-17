'use client'

import { useEffect, useState, useCallback } from 'react'

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
  const [toggling, setToggling] = useState<string | null>(null)

  const loadDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/devices')
      const data = await res.json()
      setDevices(data.devices || [])
    } catch (error) {
      console.error('Fehler beim Laden der Geräte:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDevices()
    const interval = setInterval(loadDevices, 2000)
    return () => clearInterval(interval)
  }, [loadDevices])

  // Barcode-Erfassung: Fange Tastatur-Events ab wenn Scanner aktiviert ist
  useEffect(() => {
    let barcodeBuffer = ''
    let barcodeTimeout: NodeJS.Timeout | null = null

    const handleKeyPress = async (e: KeyboardEvent) => {
      // Prüfe ob ein Scanner aktiviert ist
      const activeScanner = devices.find(d => d.enabled && d.connected)
      if (!activeScanner) return

      // Enter-Taste = Ende des Barcodes
      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0) {
          console.log('Barcode erkannt:', barcodeBuffer)
          
          // Sende Barcode an API
          try {
            await fetch('/api/scanner/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ barcode: barcodeBuffer })
            })
            // Lade Geräte neu um letzten Scan anzuzeigen
            setTimeout(() => loadDevices(), 500)
          } catch (error) {
            console.error('Fehler beim Senden des Barcodes:', error)
          }
          
          barcodeBuffer = ''
        }
        e.preventDefault()
        return
      }

      // Normale Zeichen zum Buffer hinzufügen
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBuffer += e.key
        
        // Reset Timeout
        if (barcodeTimeout) clearTimeout(barcodeTimeout)
        barcodeTimeout = setTimeout(() => {
          barcodeBuffer = ''
        }, 1000) // Reset nach 1 Sekunde Inaktivität
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      if (barcodeTimeout) clearTimeout(barcodeTimeout)
    }
  }, [devices, loadDevices])

  const toggleDevice = async (deviceId: string, currentEnabled: boolean) => {
    if (toggling === deviceId) return // Verhindere mehrfache Klicks
    
    setToggling(deviceId)
    const newEnabled = !currentEnabled
    
    try {
      console.log(`Toggle Device: ${deviceId}, von ${currentEnabled} zu ${newEnabled}`);
      
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled })
      })
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (res.ok) {
        // Sofort UI aktualisieren
        setDevices(prev => prev.map(d => 
          d.id === deviceId ? { ...d, enabled: newEnabled } : d
        ))
        // Dann neu laden
        setTimeout(() => loadDevices(), 500)
      } else {
        console.error('API Fehler:', data);
        alert(`Fehler: ${data.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Fehler beim Umschalten des Geräts:', error)
      alert(`Fehler beim Umschalten: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <header style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                margin: 0,
                color: '#1a202c',
                marginBottom: '0.5rem'
              }}>
                DeviceBox Admin
              </h1>
              <p style={{
                fontSize: '1rem',
                color: '#718096',
                margin: 0
              }}>
                Geräteverwaltung und Scanner-Kontrolle
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <div style={{
                background: '#edf2f7',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#4a5568',
                fontWeight: '600'
              }}>
                {devices.length} {devices.length === 1 ? 'Gerät' : 'Geräte'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <section>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#ffffff'
            }}>
              Geräteliste
            </h2>

            {loading ? (
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '1rem', color: '#718096' }}>Lade Geräte...</div>
              </div>
            ) : devices.length === 0 ? (
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>Keine Geräte gefunden</div>
                <div style={{ fontSize: '0.875rem', color: '#a0aec0' }}>
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
                    onToggle={() => toggleDevice(device.id, device.enabled)}
                    isToggling={toggling === device.id}
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

function DeviceCard({ device, onToggle, isToggling }: { device: Device; onToggle: () => void; isToggling: boolean }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: '1px solid #e2e8f0'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '2rem',
        alignItems: 'start'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: device.connected ? '#48bb78' : '#cbd5e0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📱
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0,
                color: '#1a202c',
                marginBottom: '0.25rem'
              }}>
                {device.name}
              </h3>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.75rem',
                  background: device.connected ? '#c6f6d5' : '#fed7d7',
                  color: device.connected ? '#22543d' : '#742a2a',
                  borderRadius: '6px'
                }}>
                  {device.connected ? '✓ Verbunden' : '✗ Getrennt'}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#718096'
                }}>
                  {device.type}
                </span>
              </div>
            </div>
          </div>

          {device.lastScan && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f7fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#718096',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600'
              }}>
                Letzter Barcode
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontFamily: 'monospace',
                color: '#1a202c',
                fontWeight: '600',
                letterSpacing: '0.1em',
                wordBreak: 'break-all'
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
            gap: '0.75rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: device.enabled ? '#48bb78' : '#a0aec0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {device.enabled ? 'Aktiv' : 'Inaktiv'}
            </span>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: isToggling ? 'wait' : 'pointer',
              userSelect: 'none',
              opacity: isToggling ? 0.6 : 1
            }}>
              <div
                onClick={isToggling ? undefined : onToggle}
                style={{
                  width: '64px',
                  height: '36px',
                  background: device.enabled ? '#48bb78' : '#cbd5e0',
                  borderRadius: '18px',
                  position: 'relative',
                  cursor: isToggling ? 'wait' : 'pointer',
                  transition: 'background 0.3s ease',
                  border: '2px solid transparent',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: device.enabled ? '30px' : '2px',
                  transition: 'left 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </div>
            </label>
            {isToggling && (
              <span style={{
                fontSize: '0.75rem',
                color: '#718096',
                fontStyle: 'italic'
              }}>
                Wird umgeschaltet...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
