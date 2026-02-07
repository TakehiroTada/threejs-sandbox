import { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { CAR_CONFIGS } from './constants.ts'
import type { CarTransform } from './types.ts'
import { Track } from './components/Track.tsx'
import { Ground } from './components/Ground.tsx'
import { RaceCars } from './components/RaceCars.tsx'
import { TpsCamera } from './components/TpsCamera.tsx'

export function Cars() {
  const [selectedCar, setSelectedCar] = useState<number | null>(null)
  const carsTransformRef = useRef<CarTransform[]>([])

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
          <RaceCars carsTransformRef={carsTransformRef} />
          <Environment files="/textures/venice_sunset_1k.hdr" />
        </Suspense>
        <Track />
        <Ground />

        {selectedCar == null ? (
          <OrbitControls
            target={[0, 0, 0]}
            maxDistance={150}
            minDistance={20}
            maxPolarAngle={Math.PI / 2.1}
          />
        ) : (
          <TpsCamera
            selectedCar={selectedCar}
            carsTransformRef={carsTransformRef}
          />
        )}
      </Canvas>

      {/* View switcher UI */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={() => setSelectedCar(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            border: selectedCar == null ? '2px solid #fff' : '2px solid transparent',
            borderRadius: '6px',
            backgroundColor: selectedCar == null ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Overview
        </button>

        {CAR_CONFIGS.map((config, i) => (
          <button
            key={i}
            onClick={() => setSelectedCar(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.6rem',
              border: selectedCar === i ? '2px solid #fff' : '2px solid transparent',
              borderRadius: '6px',
              backgroundColor: selectedCar === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: config.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
