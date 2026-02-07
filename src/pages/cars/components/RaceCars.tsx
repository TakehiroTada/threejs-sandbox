import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import {
  MODEL_URL,
  SHADOW_URL,
  DRACO_PATH,
  CAR_CONFIGS,
  SEMI_MAJOR,
  SEMI_MINOR,
  LANE_WIDTH,
} from '../constants.ts'

interface CarState {
  model: THREE.Object3D
  wheels: THREE.Object3D[]
  speed: number
  angle: number
  lane: number
}

export function RaceCars() {
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
