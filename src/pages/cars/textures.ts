import * as THREE from 'three'

export function createAsphaltTexture(): THREE.CanvasTexture {
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

export function createCurbTexture(): THREE.CanvasTexture {
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

export function createCheckeredTexture(): THREE.CanvasTexture {
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

export function createGrassTexture(): THREE.CanvasTexture {
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
