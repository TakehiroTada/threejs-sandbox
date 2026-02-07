import { Link } from '@tanstack/react-router'

export function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1rem',
      }}
    >
      <h1>Three.js Sandbox</h1>
      <p>
        <Link to="/cars" style={{ color: '#646cff' }}>
          Cars Demo
        </Link>
        {' '}&mdash; 3D car viewer with customizable materials
      </p>
    </div>
  )
}
