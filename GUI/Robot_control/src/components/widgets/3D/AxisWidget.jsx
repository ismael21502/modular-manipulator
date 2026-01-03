import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { Line, Html, Text } from '@react-three/drei'
import { Billboard } from '@react-three/drei'

export default function OrientationGizmo({ size }) {
    const { colors } = useTheme()
    const [hovered, setHovered] = useState(false)

    return (
        <group
            position={[0, 0, 0]}
            scale={[size, size, size]}
        >
            <AxisDot size={size} color={colors.axes.x} direction={[1, 0, 0]} label={"X"} />
            <AxisDot size={size} color={colors.axes.x} direction={[-1, 0, 0]} negative={true} />
            <AxisDot size={size} color={colors.axes.z} direction={[0, 1, 0]} label={"Z"} />
            <AxisDot size={size} color={colors.axes.z} direction={[0, -1, 0]} negative={true} />
            <AxisDot size={size} color={colors.axes.y} direction={[0, 0, -1]} label={"Y"} />
            <AxisDot size={size} color={colors.axes.y} direction={[0, 0, 1]} negative={true} />

            <AxisLine color={colors.axes.x} direction={[1, 0, 0]} />
            <AxisLine color={colors.axes.z} direction={[0, 1, 0]} />
            <AxisLine color={colors.axes.y} direction={[0, 0, -1]} />

            <Billboard
                position={[0, 0, 0]} // Lo elevamos un poco
                follow={true} // Esto es TRUE por defecto, pero lo pongo explícito
            >
                <mesh>
                    <planeGeometry args={[1, 1]} />
                    {/* Usamos DoubleSide para asegurarnos de que se vea bien, 
                              aunque el Billboard debería evitar que veamos la espalda */}
                    <meshBasicMaterial color="#ff3366" />
                </mesh>
            </Billboard>

            <Html 
            pointerEvents='none'
            center>
                <div className="rounded-full relative"
                style={{width: size*11, height: size*11, backgroundColor: hovered?  `${colors.text.primary}0F`: 'transparent'}}
                    onMouseEnter={(e) => {
                        e.stopPropagation()
                        setHovered(true)
                    }}
                    onMouseLeave={(e) => {
                        e.stopPropagation()
                        setHovered(false)
                    }}
                    onClick={(e) => console.log("CLICK 2")}
                    ></div>
            </Html>
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

const AxisDot = ({ color, negative = false, direction = [0, 0, 0], label, size }) => {
    const [hovered, setHovered] = useState(false)

    return (
        <mesh
            position={direction.map(v => v * 4)}
            onClick={(e) => console.log(direction)}
            >

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
                <div className="flex justify-center items-center rounded-full"
                    onMouseEnter={(e) => {
                        e.stopPropagation()
                        setHovered(true)
                        console.log(label)
                    }}
                    onMouseLeave={(e) => {
                        e.stopPropagation()
                        setHovered(false)
                }}
                onClick={(e)=>console.log("CLICK")}
                style={{backgroundColor: color, width: size*2, height: size*2, scale: hovered? 1.1 : 1}}>
                    {label}
                </div>
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