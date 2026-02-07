import { useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, useTexture, Line } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/ferrari.glb'
const SHADOW_URL = '/models/ferrari_ao.png'
const DRACO_PATH = '/draco/'

const SEMI_MAJOR = 40
const SEMI_MINOR = 25
const TRACK_WIDTH = 20
const LANE_WIDTH = TRACK_WIDTH / 8
const CURB_WIDTH = 1.5

const CAR_CONFIGS = [
  { color: '#ff0000', speed: 0.32 },
  { color: '#0055ff', speed: 0.30 },
  { color: '#00cc00', speed: 0.34 },
  { color: '#ffcc00', speed: 0.29 },
  { color: '#ff6600', speed: 0.33 },
  { color: '#9900ff', speed: 0.31 },
  { color: '#00cccc', speed: 0.28 },
  { color: '#ff1493', speed: 0.35 },
]

function getOutwardNormal(t: number) {
  const nx = SEMI_MINOR * Math.cos(t)
  const nz = SEMI_MAJOR * Math.sin(t)
  const len = Math.sqrt(nx * nx + nz * nz)
  return { nx: nx / len, nz: nz / len }
}

// --- Procedural textures ---

function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect(0, 0, 256, 256)
  const imageData = ctx.getImageData(0, 0, 256, 256)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15
    imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise))
    imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise))
    imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

function createCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 4
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#cc0000'
  ctx.fillRect(0, 0, 32, 4)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(32, 0, 32, 4)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  return tex
}

function createCheckeredTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const cells = 8
  const cellSize = 128 / cells
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#111111'
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }
  return new THREE.CanvasTexture(canvas)
}

function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#2d7d2d'
  ctx.fillRect(0, 0, 256, 256)
  const imageData = ctx.getImageData(0, 0, 256, 256)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25
    imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise * 0.5))
    imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise))
    imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise * 0.3))
  }
  ctx.putImageData(imageData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(20, 20)
  return tex
}

// --- Geometry builders ---

function buildTrackGeometry() {
  const segments = 256
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const cx = SEMI_MAJOR * Math.cos(t)
    const cz = SEMI_MINOR * Math.sin(t)
    const { nx, nz } = getOutwardNormal(t)

    positions.push(cx - nx * TRACK_WIDTH / 2, 0.01, cz - nz * TRACK_WIDTH / 2)
    positions.push(cx + nx * TRACK_WIDTH / 2, 0.01, cz + nz * TRACK_WIDTH / 2)

    const u = (i / segments) * 40
    uvs.push(u, 0)
    uvs.push(u, 1)

    if (i < segments) {
      const base = i * 2
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function buildCurbGeometry(inner: boolean) {
  const segments = 256
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const baseOffset = inner ? -TRACK_WIDTH / 2 : TRACK_WIDTH / 2
  const dir = inner ? -1 : 1

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const cx = SEMI_MAJOR * Math.cos(t)
    const cz = SEMI_MINOR * Math.sin(t)
    const { nx, nz } = getOutwardNormal(t)

    positions.push(cx + nx * baseOffset, 0.02, cz + nz * baseOffset)
    positions.push(
      cx + nx * (baseOffset + dir * CURB_WIDTH),
      0.02,
      cz + nz * (baseOffset + dir * CURB_WIDTH),
    )

    const u = (i / segments) * 60
    uvs.push(u, 0)
    uvs.push(u, 1)

    if (i < segments) {
      const base = i * 2
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function getEllipseLinePoints(offset: number, segments = 128): [number, number, number][] {
  const pts: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const cx = SEMI_MAJOR * Math.cos(t)
    const cz = SEMI_MINOR * Math.sin(t)
    const { nx, nz } = getOutwardNormal(t)
    pts.push([cx + nx * offset, 0.05, cz + nz * offset])
  }
  return pts
}

// --- Scene components ---

function Track() {
  const trackGeo = useMemo(() => buildTrackGeometry(), [])
  const innerCurbGeo = useMemo(() => buildCurbGeometry(true), [])
  const outerCurbGeo = useMemo(() => buildCurbGeometry(false), [])
  const asphaltTex = useMemo(() => createAsphaltTexture(), [])
  const curbTex = useMemo(() => createCurbTexture(), [])
  const checkeredTex = useMemo(() => createCheckeredTexture(), [])

  const innerBorder = useMemo(() => getEllipseLinePoints(-TRACK_WIDTH / 2), [])
  const outerBorder = useMemo(() => getEllipseLinePoints(TRACK_WIDTH / 2), [])

  const laneLines = useMemo(
    () => [-3, -2, -1, 0, 1, 2, 3].map((m) => getEllipseLinePoints(m * LANE_WIDTH)),
    [],
  )

  return (
    <group>
      {/* Asphalt surface */}
      <mesh geometry={trackGeo}>
        <meshStandardMaterial map={asphaltTex} roughness={0.85} />
      </mesh>

      {/* Red/white curbs */}
      <mesh geometry={innerCurbGeo}>
        <meshStandardMaterial map={curbTex} roughness={0.7} />
      </mesh>
      <mesh geometry={outerCurbGeo}>
        <meshStandardMaterial map={curbTex} roughness={0.7} />
      </mesh>

      {/* White border lines */}
      <Line points={innerBorder} color="white" lineWidth={3} />
      <Line points={outerBorder} color="white" lineWidth={3} />

      {/* Dashed lane markings */}
      {laneLines.map((pts, i) => (
        <Line key={i} points={pts} color="white" lineWidth={1} dashed dashSize={2} gapSize={2} />
      ))}

      {/* Start / finish checkered line */}
      <mesh position={[SEMI_MAJOR, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH, 3]} />
        <meshBasicMaterial map={checkeredTex} />
      </mesh>
    </group>
  )
}

interface CarState {
  model: THREE.Object3D
  wheels: THREE.Object3D[]
  speed: number
  angle: number
  lane: number
}

function RaceCars() {
  const gltf = useGLTF(MODEL_URL, DRACO_PATH)
  const shadowTexture = useTexture(SHADOW_URL)

  const cars = useMemo<CarState[]>(() => {
    return CAR_CONFIGS.map((config, i) => {
      const model = gltf.scene.children[0].clone(true)

      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(config.color),
        metalness: 1.0,
        roughness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
      })
      const detailsMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.5,
      })
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.25,
        roughness: 0,
        transmission: 1.0,
      })

      const apply = (name: string, mat: THREE.Material) => {
        const obj = model.getObjectByName(name)
        if (obj instanceof THREE.Mesh) obj.material = mat
      }
      apply('body', bodyMat)
      apply('rim_fl', detailsMat)
      apply('rim_fr', detailsMat)
      apply('rim_rr', detailsMat)
      apply('rim_rl', detailsMat)
      apply('trim', detailsMat)
      apply('glass', glassMat)

      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          blending: THREE.MultiplyBlending,
          toneMapped: false,
          transparent: true,
          premultipliedAlpha: true,
        }),
      )
      shadow.rotation.x = -Math.PI / 2
      shadow.renderOrder = 2
      model.add(shadow)

      const wheels = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr']
        .map((n) => model.getObjectByName(n))
        .filter((w): w is THREE.Object3D => w != null)

      return {
        model,
        wheels,
        speed: config.speed,
        angle: (i / CAR_CONFIGS.length) * Math.PI * 2,
        lane: i,
      }
    })
  }, [gltf.scene, shadowTexture])

  useFrame((_, delta) => {
    for (const car of cars) {
      car.angle += car.speed * delta

      const t = car.angle
      const cx = SEMI_MAJOR * Math.cos(t)
      const cz = SEMI_MINOR * Math.sin(t)

      const tx = -SEMI_MAJOR * Math.sin(t)
      const tz = SEMI_MINOR * Math.cos(t)
      const tLen = Math.sqrt(tx * tx + tz * tz)

      const nx = tz / tLen
      const nz = -tx / tLen

      const laneOffset = (car.lane - 3.5) * LANE_WIDTH

      car.model.position.set(cx + nx * laneOffset, 0, cz + nz * laneOffset)
      car.model.rotation.y = Math.atan2(tx, tz)

      for (const wheel of car.wheels) {
        wheel.rotation.x -= car.speed * delta * 15
      }
    }
  })

  return (
    <group>
      {cars.map((car, i) => (
        <primitive key={i} object={car.model} />
      ))}
    </group>
  )
}

function Ground() {
  const grassTex = useMemo(() => createGrassTexture(), [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial map={grassTex} roughness={1} />
    </mesh>
  )
}

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
