import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { SEMI_MAJOR, TRACK_WIDTH, LANE_WIDTH } from '../constants.ts'
import { buildTrackGeometry, buildCurbGeometry, getEllipseLinePoints } from '../geometry.ts'
import { createAsphaltTexture, createCurbTexture, createCheckeredTexture } from '../textures.ts'

export function Track() {
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
