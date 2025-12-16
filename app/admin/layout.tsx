import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav style={{
        background: '#111',
        borderBottom: '1px solid #333',
        padding: '1rem 2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.875rem',
            opacity: 0.7
          }}>
            ← Zurück zur Startseite
          </Link>
        </div>
      </nav>
      {children}
    </>
  )
}

