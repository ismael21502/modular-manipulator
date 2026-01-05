import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { Line, Html, Text } from '@react-three/drei'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

export default function OrientationGizmo({ size, onSetDirection }) {
    const { colors } = useTheme()
    const [hovered, setHovered] = useState(false)
    return (
        <group
            position={[0, 0, 0]}
            scale={[size, size, size]}
        >
            <AxisDot onClick={onSetDirection} size={size} color={colors.axes.x} direction={[1, 0, 0]} label={"X"} />
            <AxisDot onClick={onSetDirection} size={size} color={colors.axes.x} direction={[-1, 0, 0]} negative={true} />
            <AxisDot onClick={onSetDirection} size={size} color={colors.axes.z} direction={[0, 1, 0]} label={"Z"} />
            <AxisDot onClick={onSetDirection} size={size} color={colors.axes.z} direction={[0, -1, 0]} negative={true} />
            <AxisDot onClick={onSetDirection} size={size} color={colors.axes.y} direction={[0, 0, -1]} label={"Y"} />
            <AxisDot onClick={onSetDirection} size={size} color={colors.axes.y} direction={[0, 0, 1]} negative={true} />

            <AxisDot onClick={onSetDirection} size={size*0.5} color={colors.text.title} direction={[0, 0, 0]} />

            <AxisLine color={colors.axes.x} direction={[1, 0, 0]} />
            <AxisLine color={colors.axes.z} direction={[0, 1, 0]} />
            <AxisLine color={colors.axes.y} direction={[0, 0, -1]} />
            <AxisLine color={colors.axes.x} direction={[-1, 0, 0]} />
            <AxisLine color={colors.axes.z} direction={[0, -1, 0]} />
            <AxisLine color={colors.axes.y} direction={[0, 0, 1]} />

        </group>
    )
}
function createCanvasTexture(color = "#fff", label = "", negative=false) {
    const size = 512
    const canvas = document.createElement("canvas")

    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext("2d")

    // Fondo transparente
    ctx.clearRect(0, 0, size, size)

    // Círculo
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2)
    ctx.fill()

    //Negativo
    ctx.fillStyle = negative ? "#FFF" : "#FFFFFF00"
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 * 0.8 - 4, 0, Math.PI * 2)
    ctx.fill()

    // Texto
    ctx.fillStyle = "#fff"
    ctx.font = `normal ${size/2*1.2}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(label, size / 2, size / 2)

    const texture = new THREE.CanvasTexture(canvas)
    return texture
}
const AxisDot = ({ color = "#FFF", label = "", negative = false, size = 1, direction, onClick }) => {
    const meshRef = useRef()

    const texture = useMemo(
        () => createCanvasTexture(color, label, negative),
        [color, label, negative]
    )

    const [hovered, setHovered] = useState(false)
    return (
        <Billboard position={direction.map(v => v * 4)}>
            <mesh 
            ref={meshRef}
            onClick={() => onClick(direction)}
                onPointerEnter={(e) => {
                    e.stopPropagation()
                    setHovered(true)
                }}
                onPointerLeave={(e) => {
                    e.stopPropagation()
                    setHovered(false)
                }}>
                <planeGeometry args={[hovered ? 1.1 * size * 0.21 : size * 0.21, hovered ? 1.1 * size * 0.21 : size * 0.21]} />
                <meshBasicMaterial 
                map={texture} 
                transparent 
                depthTest={false} 
                opacity={1} 
                toneMapped={false} />
            </mesh>
        </Billboard>
    )
}

const AxisDot2 = ({ color, negative = false, direction = [0, 0, 0], label, size, onClick }) => {
    const [hovered, setHovered] = useState(false)
    return (
        <Html
            position={direction.map(v => v * 4)}

            center
            style={{
                whiteSpace: "nowrap",
                color: "white",
                fontSize: "12px",
                fontWeight: hovered ? "bold" : "normal",
                userSelect: "none",
            }}
        >
            <div className="flex justify-center items-center rounded-full"
                onMouseEnter={(e) => {
                    e.stopPropagation()
                    setHovered(true)
                }}
                onMouseLeave={(e) => {
                    e.stopPropagation()
                    setHovered(false)
                }}
                onClick={() => onClick(direction)}
                style={{ backgroundColor: color, width: size * 2, height: size * 2, scale: hovered ? 1.1 : 1 }}>
                {negative
                    ? <div className='absolute inset-0.5 rounded-full bg-white opacity-90'></div>
                    : <>{label}</>}
            </div>
        </Html>
    )
}

const AxisLine = ({ color, direction = [0, 0, 0] }) => {
    return (
        <Line
            points={[
                direction.map(v => v * 1),
                direction.map(v => v * 2.5)
            ]}
            color={color}
            lineWidth={3}
            depthTest={false}
            transparent
            opacity={1}
        />
    )
}