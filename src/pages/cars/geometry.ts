import * as THREE from 'three'
import { SEMI_MAJOR, SEMI_MINOR, TRACK_WIDTH, CURB_WIDTH } from './constants.ts'
import { getOutwardNormal } from './math.ts'

export function buildTrackGeometry() {
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

export function buildCurbGeometry(inner: boolean) {
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

export function getEllipseLinePoints(offset: number, segments = 128): [number, number, number][] {
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
