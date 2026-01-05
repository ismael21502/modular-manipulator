import { useMemo } from 'react'
import * as THREE from 'three'

// export function TextLabel3D({ text, color, position }) {
//   // 1. Creamos el dibujo en un canvas "en memoria"
//   const texture = useMemo(() => {
//     const canvas = document.createElement('canvas')
//     const ctx = canvas.getContext('2d')
//     canvas.width = 256
//     canvas.height = 256

//     // Dibujamos un fondo circular (estilo tu cursor)
//     ctx.fillStyle = `${color}33` // Transparente
//     ctx.beginPath()
//     ctx.arc(128, 128, 100, 0, Math.PI * 2)
//     ctx.fill()
//     ctx.strokeStyle = color
//     ctx.lineWidth = 10
//     ctx.stroke()

//     // Dibujamos el texto (X, Y, Z o coordenadas)
//     ctx.font = 'Bold 80px Arial'
//     ctx.fillStyle = 'white'
//     ctx.textAlign = 'center'
//     ctx.fillText(text, 128, 155)

//     return new THREE.CanvasTexture(canvas)
//   }, [text, color])

//   return (
//     <mesh position={position}>
//       {/* 2. Usamos un plano que siempre mire a la cámara */}
//       <planeGeometry args={[0.1, 0.1]} />
//       <meshBasicMaterial
//         map={texture}
//         transparent={true}
//         side={THREE.DoubleSide}
//         depthTest={false}
//         depthWrite={false}
//       />
//     </mesh>
//   )
// }

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

export default function TCPCursor({ position, color = "#FFF", size = 1 }) {
  const meshRef = useRef()

  // 1. Creamos el canvas y la textura UNA SOLA VEZ
  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    const texture = new THREE.CanvasTexture(canvas)
    return { canvas, ctx, texture }
  }, [])

  useFrame(({ camera, clock }) => {
    if (!meshRef.current) return

    // --- LÓGICA DE GIRO (DIBUJO) ---
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    ctx.clearRect(0, 0, canvas.width, canvas.height) // Limpiar frame anterior

    // --- 1. ANILLO DASHED ---
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5; // Grosor del anillo
    
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -clock.getElapsedTime() * 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // --- 2. CÍRCULO INTERIOR ---
    ctx.beginPath(); // NUEVO CAMINO para que no herede el dashed
    ctx.fillStyle = color;
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `${color}33` // Transparente
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 25, 0, Math.PI * 2)
    ctx.fill()

    // --- 3. LÍNEAS DE MIRA (SNIPER) ---
    ctx.beginPath(); // NUEVO CAMINO para las líneas rectas
    ctx.strokeStyle = color;
    ctx.lineWidth = 5; // ASEGÚRATE de definirlo justo antes de stroke()
    ctx.lineCap = "round"; // Tip Pro: hace que las puntas de las líneas sean redondeadas

    const gap = 12.5;
    const largo = 24;

    // Definimos todas las coordenadas
    ctx.moveTo(cx, cy - gap); ctx.lineTo(cx, cy - gap - largo); // Arriba
    ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + largo); // Abajo
    ctx.moveTo(cx - gap, cy); ctx.lineTo(cx - gap - largo, cy); // Izquierda
    ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + largo, cy); // Derecha

    ctx.stroke() // Aquí es donde se aplica el lineWidth a todo el path actual

    // IMPORTANTE: Avisar a Three.js que el canvas cambió
    texture.needsUpdate = true

    // --- LÓGICA DE ESCALA Y ORIENTACIÓN ---
    meshRef.current.quaternion.copy(camera.quaternion)
    const dist = meshRef.current.position.distanceTo(camera.position)
    const vFOV = (camera.fov * Math.PI) / 180
    const scaleHeight = 2 * Math.tan(vFOV / 2) * dist
    const desiredScale = scaleHeight * 0.15 * size
    meshRef.current.scale.set(desiredScale, desiredScale, 1)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthTest={false} />
    </mesh>
  )
}