import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CarTransform } from '../types.ts'

const CAMERA_BEHIND = 10
const CAMERA_HEIGHT = 4
const LOOK_AHEAD = 10
const LOOK_HEIGHT = 1

interface TpsCameraProps {
  selectedCar: number
  carsTransformRef: { readonly current: CarTransform[] }
}

export function TpsCamera({ selectedCar, carsTransformRef }: TpsCameraProps) {
  const cameraPos = useRef(new THREE.Vector3())
  const lookAtPos = useRef(new THREE.Vector3())
  const initialized = useRef(false)
  const prevCar = useRef(selectedCar)

  useEffect(() => {
    if (prevCar.current !== selectedCar) {
      initialized.current = false
      prevCar.current = selectedCar
    }
  }, [selectedCar])

  useFrame(({ camera }, delta) => {
    const transform = carsTransformRef.current[selectedCar]
    if (!transform) return

    const targetPos = _targetPos
      .copy(transform.position)
      .addScaledVector(transform.forward, CAMERA_BEHIND)
    targetPos.y += CAMERA_HEIGHT

    const targetLookAt = _targetLookAt
      .copy(transform.position)
      .addScaledVector(transform.forward, -LOOK_AHEAD)
    targetLookAt.y += LOOK_HEIGHT

    if (!initialized.current) {
      cameraPos.current.copy(targetPos)
      lookAtPos.current.copy(targetLookAt)
      initialized.current = true
    } else {
      const t = 1 - Math.exp(-5 * delta)
      cameraPos.current.lerp(targetPos, t)
      lookAtPos.current.lerp(targetLookAt, t)
    }

    camera.position.copy(cameraPos.current)
    camera.lookAt(lookAtPos.current)
  })

  return null
}

const _targetPos = new THREE.Vector3()
const _targetLookAt = new THREE.Vector3()
