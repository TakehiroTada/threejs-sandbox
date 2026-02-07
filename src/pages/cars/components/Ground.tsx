import { useMemo } from 'react'
import { createGrassTexture } from '../textures.ts'

export function Ground() {
  const grassTex = useMemo(() => createGrassTexture(), [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial map={grassTex} roughness={1} />
    </mesh>
  )
}
