import { SEMI_MAJOR, SEMI_MINOR } from './constants.ts'

export function getOutwardNormal(t: number) {
  const nx = SEMI_MINOR * Math.cos(t)
  const nz = SEMI_MAJOR * Math.sin(t)
  const len = Math.sqrt(nx * nx + nz * nz)
  return { nx: nx / len, nz: nz / len }
}
