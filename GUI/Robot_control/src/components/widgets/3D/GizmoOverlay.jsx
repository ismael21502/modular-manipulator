import {  useThree, useFrame } from '@react-three/fiber'
import { createPortal } from 'react-dom'
import { Scene } from 'three'
import { useRef, useMemo } from 'react'
import { OrthographicCamera } from '@react-three/drei'

export function GizmoOverlay({ children }) {
  const scene = useMemo(() => new Scene(), [])
  const camRef = useRef()
  const { size, gl } = useThree()

  useFrame(() => {
    gl.autoClear = false
    gl.clearDepth()
    gl.render(scene, camRef.current)
  }, 1)

  return (
    <>
      <OrthographicCamera
        ref={camRef}
        makeDefault={false}
        position={[0, 0, 10]}
        left={-size.width / 2}
        right={size.width / 2}
        top={size.height / 2}
        bottom={-size.height / 2}
        near={1}
        far={100}
      />
      {createPortal(children, scene)}
    </>
  )
}
