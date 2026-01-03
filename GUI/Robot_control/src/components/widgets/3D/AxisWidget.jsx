import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { Line, Html, Text } from '@react-three/drei'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

export default function OrientationGizmo({ size, onSetDirection }) {
    const { colors } = useTheme()
    const [hovered, setHovered] = useState(false)
    // const forward = new THREE.Vector3(0, 0, -1) // frente por defecto
    // const target = new THREE.Vector3(1, 0, 0)   // +X

    // const q = new THREE.Quaternion()
    // q.setFromUnitVectors(forward, target)

    // // useFrame(()=>{
    // //     console.log(q)
    // // })

    // const setDirection = () => {
    //     console.log("Q: ",q)
    //     console.log("Camera quat 1",cameraQuaternion.current)
    //     cameraQuaternion.current.copy(q)
    //     console.log("Camera quat 2", cameraQuaternion.current)
    // }
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

            {/* <AxisLine color={colors.axes.x} direction={[1, 0, 0]} />
            <AxisLine color={colors.axes.z} direction={[0, 1, 0]} />
            <AxisLine color={colors.axes.y} direction={[0, 0, -1]} /> */}

            <Html center>
                <div className="flex rounded-full bg-black"
                style={{width: size*.75, height:size*.75, backgroundColor: colors.text.title}}></div>
            </Html>
        </group>
    )
}

const AxisDot = ({ color, negative = false, direction = [0, 0, 0], label, size, onClick }) => {
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
                [0, 0, 0],
                direction.map(v => v * 4)
            ]}
            color={color}
            lineWidth={3}
            depthTest={false}
            transparent
            opacity={1}
        />
    )
}