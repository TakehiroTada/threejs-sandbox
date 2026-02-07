import { Link, Outlet } from '@tanstack/react-router'

export function Layout() {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333',
        }}
      >
        <Link
          to="/"
          style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}
        >
          Home
        </Link>
        <Link
          to="/cars"
          style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}
        >
          Cars
        </Link>
      </nav>
      <main style={{ flex: 1, position: 'relative' }}>
        <Outlet />
      </main>
    </div>
  )
}
