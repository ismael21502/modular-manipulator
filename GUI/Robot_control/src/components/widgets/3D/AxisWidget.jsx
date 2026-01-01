import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { Line, Html, Text } from '@react-three/drei'

export default function OrientationGizmo({ size }) {
    const { colors } = useTheme()
    const [hovered, setHovered] = useState(false)

    return (
        <group
            position={[0, 0, 0]}
            scale={[size, size, size]}

        >
            <AxisDot color={colors.axes.x} direction={[1, 0, 0]} label={"X"} />
            <AxisDot color={colors.axes.x} direction={[-1, 0, 0]} negative={true} />
            <AxisDot color={colors.axes.z} direction={[0, 1, 0]} label={"Z"} />
            <AxisDot color={colors.axes.z} direction={[0, -1, 0]} negative={true} />
            <AxisDot color={colors.axes.y} direction={[0, 0, -1]} label={"Y"} />
            <AxisDot color={colors.axes.y} direction={[0, 0, 1]} negative={true} />

            <AxisLine color={colors.axes.x} direction={[1, 0, 0]} />
            <AxisLine color={colors.axes.z} direction={[0, 1, 0]} />
            <AxisLine color={colors.axes.y} direction={[0, 0, -1]} />
            {/* <group>
                <mesh
                    onPointerOver={(e) => {
                        e.stopPropagation()
                        setHovered(true)
                    }}
                    onPointerOut={(e) => {
                        e.stopPropagation()
                        setHovered(false)
                    }}
                >
                    <sphereGeometry args={[5.5, 32, 32]} />
                    <meshBasicMaterial color={colors.background} transparent opacity={hovered ? 0.5 : 0} depthTest={false} depthWrite={false} />
                </mesh>
            </group> */}
        </group>
    )
}

const AxisDot = ({ color, negative = false, direction = [0, 0, 0], label }) => {
    const [hovered, setHovered] = useState(false)
    
    return (
        <mesh
            position={direction.map(v => v * 4)}
            onClick={(e) => console.log(direction)}
            onPointerOver={(e) => {
                e.stopPropagation()
                setHovered(true)
                console.log(label)
            }}
            onPointerOut={(e) => {
                e.stopPropagation()
                setHovered(false)
            }}>
            <sphereGeometry args={[negative ? hovered ? 1 : 0.8 : hovered ? 1.1 : 1, 16, 16]} />
            {/* <boxGeometry /> */}
            <meshBasicMaterial color={color} transparent opacity={negative ? 0.75 : 1} />
            <Html
                position={[0, 0, 0]}
                center
                style={{
                    whiteSpace: "nowrap",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: hovered ? "bold" : "normal",
                    userSelect: "none",
                    pointerEvents: "none",
                }}
            >
                {label}
            </Html>
        </mesh>
    )
}

const AxisLine = ({ color, direction = [0, 0, 0] }) => {
    return (
        <Line
            points={[
                [0, 0, 0],
                direction.map(v => v * 4)
            ]}
            color={color}
            lineWidth={2.5}
            depthTest={false}
            transparent
            opacity={1}
        />
    )
}