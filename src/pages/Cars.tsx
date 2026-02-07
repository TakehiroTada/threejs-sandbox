import { useRef, useEffect, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/ferrari.glb'
const SHADOW_URL = '/models/ferrari_ao.png'
const DRACO_PATH = '/draco/'

interface CarModelProps {
  bodyColor: string
  detailsColor: string
  glassColor: string
}

function CarModel({ bodyColor, detailsColor, glassColor }: CarModelProps) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)
  const shadowTexture = useTexture(SHADOW_URL)
  const wheelsRef = useRef<THREE.Object3D[]>([])
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const detailsMatRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const glassMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const shadowAdded = useRef(false)

  useEffect(() => {
    const carModel = scene.children[0]
    if (!carModel) return

    if (!bodyMatRef.current) {
      bodyMatRef.current = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(bodyColor),
        metalness: 1.0,
        roughness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
      })
    }

    if (!detailsMatRef.current) {
      detailsMatRef.current = new THREE.MeshStandardMaterial({
        color: new THREE.Color(detailsColor),
        metalness: 1.0,
        roughness: 0.5,
      })
    }

    if (!glassMatRef.current) {
      glassMatRef.current = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(glassColor),
        metalness: 0.25,
        roughness: 0,
        transmission: 1.0,
      })
    }

    const applyMaterial = (name: string, material: THREE.Material) => {
      const obj = carModel.getObjectByName(name)
      if (obj && obj instanceof THREE.Mesh) {
        obj.material = material
      }
    }

    applyMaterial('body', bodyMatRef.current)
    applyMaterial('rim_fl', detailsMatRef.current)
    applyMaterial('rim_fr', detailsMatRef.current)
    applyMaterial('rim_rr', detailsMatRef.current)
    applyMaterial('rim_rl', detailsMatRef.current)
    applyMaterial('trim', detailsMatRef.current)
    applyMaterial('glass', glassMatRef.current)

    wheelsRef.current = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr']
      .map((name) => carModel.getObjectByName(name))
      .filter((w): w is THREE.Object3D => w != null)

    if (!shadowAdded.current) {
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          blending: THREE.MultiplyBlending,
          toneMapped: false,
          transparent: true,
          premultipliedAlpha: true,
        }),
      )
      shadowMesh.rotation.x = -Math.PI / 2
      shadowMesh.renderOrder = 2
      carModel.add(shadowMesh)
      shadowAdded.current = true
    }
  }, [scene, shadowTexture, bodyColor, detailsColor, glassColor])

  useEffect(() => {
    if (bodyMatRef.current) {
      bodyMatRef.current.color.set(bodyColor)
    }
  }, [bodyColor])

  useEffect(() => {
    if (detailsMatRef.current) {
      detailsMatRef.current.color.set(detailsColor)
    }
  }, [detailsColor])

  useEffect(() => {
    if (glassMatRef.current) {
      glassMatRef.current.color.set(glassColor)
    }
  }, [glassColor])

  useFrame(() => {
    const time = -performance.now() / 1000
    for (const wheel of wheelsRef.current) {
      wheel.rotation.x = time * Math.PI * 2
    }
  })

  return <primitive object={scene} />
}

function AnimatedGrid() {
  const gridRef = useRef<THREE.GridHelper>(null)

  useFrame(() => {
    if (gridRef.current) {
      const time = -performance.now() / 1000
      gridRef.current.position.z = -(time) % 1
    }
  })

  return (
    <gridHelper
      ref={gridRef}
      args={[20, 40, 0xffffff, 0xffffff]}
      material-opacity={0.2}
      material-depthWrite={false}
      material-transparent={true}
    />
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 0.5, 2]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

export function Cars() {
  const [bodyColor, setBodyColor] = useState('#ff0000')
  const [detailsColor, setDetailsColor] = useState('#ffffff')
  const [glassColor, setGlassColor] = useState('#ffffff')

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [4.25, 1.4, -4.5],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
        scene={{ background: new THREE.Color(0x333333) }}
      >
        <fog attach="fog" args={['#333333', 10, 15]} />
        <Suspense fallback={<LoadingFallback />}>
          <CarModel
            bodyColor={bodyColor}
            detailsColor={detailsColor}
            glassColor={glassColor}
          />
          <Environment files="/textures/venice_sunset_1k.hdr" />
        </Suspense>
        <AnimatedGrid />
        <OrbitControls
          target={[0, 0.5, 0]}
          maxDistance={9}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.875rem' }}>
          Body
          <input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.875rem' }}>
          Details
          <input type="color" value={detailsColor} onChange={(e) => setDetailsColor(e.target.value)} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.875rem' }}>
          Glass
          <input type="color" value={glassColor} onChange={(e) => setGlassColor(e.target.value)} />
        </label>
      </div>
    </div>
  )
}
