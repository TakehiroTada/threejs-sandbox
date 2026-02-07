import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Track } from './components/Track.tsx'
import { Ground } from './components/Ground.tsx'
import { RaceCars } from './components/RaceCars.tsx'

export function Cars() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [0, 50, 60],
          fov: 50,
          near: 0.1,
          far: 500,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
        scene={{ background: new THREE.Color(0x87ceeb) }}
      >
        <Suspense fallback={null}>
          <RaceCars />
          <Environment files="/textures/venice_sunset_1k.hdr" />
        </Suspense>
        <Track />
        <Ground />
        <OrbitControls
          target={[0, 0, 0]}
          maxDistance={150}
          minDistance={20}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}
