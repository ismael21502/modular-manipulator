import { useThree, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { Line, Html, Text } from '@react-three/drei'

export default function OrientationGizmo({ size }) {
    const ref = useRef()
    const { camera } = useThree()
    const { colors } = useTheme()
    useFrame(() => {
        ref.current.quaternion.copy(camera.quaternion).invert()
    })

    return (
        <group
            ref={ref}
            position={[0, 0, 0]}
            scale={[size, size, size]}
        >
            <AxisDot color={colors.axes.x} direction={[1, 0, 0]} label={"X"}/>
            <AxisDot color={colors.axes.x} direction={[-1, 0, 0]} label={"-X"} negative={true} />
            <AxisDot color={colors.axes.z} direction={[0, 1, 0]} label={"Z"} />
            <AxisDot color={colors.axes.z} direction={[0, -1, 0]} label={"-Z"} negative={true} />
            <AxisDot color={colors.axes.y} direction={[0, 0, -1]} label={"Y"} />
            <AxisDot color={colors.axes.y} direction={[0, 0, 1]} label={"-Y"} negative={true} />

            <AxisLine color={colors.axes.x} direction={[1, 0, 0]} />
            <AxisLine color={colors.axes.z} direction={[0, 1, 0]} />
            <AxisLine color={colors.axes.y} direction={[0, 0, -1]} />

            {/* <mesh>
                <boxGeometry args={[1,1,1]} />
                <meshBasicMaterial color={colors.text.primary} transparent opacity={1}/>
            </mesh> */}
        </group>
    )
}

const AxisDot = ({ color, negative = false, direction = [0, 0, 0], label }) => {
    return (
        <mesh position={direction.map(v => v * 4)}>
            <sphereGeometry args={[negative ? .85 : 1, 16, 16]} />
            {/* <boxGeometry /> */}
            <meshBasicMaterial  color={color} transparent opacity={negative ? 0.75 : 1} />
            <Html
                position={[0, 0, 0]}
                center
                style={{
                    whiteSpace: "nowrap",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
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