import { useRobotConfig } from '../../../context/RobotConfig'
import { useRef, useMemo } from 'react'
import { useRobotState } from '../../../context/RobotState'

function Robot({position=[0,0,0]}) {
    const { robotConfig } = useRobotConfig()
    const state = useRobotState()
    const joints = state.robotState.joints
    if (!robotConfig) return null
    const rootJoint = robotConfig.joints.find(j => j.parent === "base")

    const jointValueById = useMemo(()=>{
        const map = {}
        robotConfig.joints.forEach((jointConfig, i)=>{
            map[jointConfig.id] = joints[i] ?? jointConfig.default ?? 0
        })
        return map
    },[joints, robotConfig.joints])

    if (!rootJoint) {
        console.error("No root joint found")
        return null
    }

    return (
        // Rotar -90° en X convierte todo a Z up como en mi robotConfig
        <group rotation={[-Math.PI/2, 0, 0]} position={position}> 
            <JointChain
                joint={rootJoint}
                config={robotConfig}
                jointValueById={jointValueById}   // luego lo conectamos a sliders
            />
        </group>
    )
}

function indexById(arr) {
    const map = {}
    arr.forEach(item => map[item.id] = item)
    return map
}
  
function JointNode({ joint, link, value, children }) {
    const jointRef = useRef()
    const degToRad = (deg) => deg * Math.PI / 180;
    const axisRotation = useMemo(() => {
        const [x, y, z] = joint.axis
        if (x) return [degToRad(value), 0, 0]
        if (y) return [0, degToRad(value), 0]
        return [0, 0, degToRad(value)]
    }, [value])

    return (
        <group
            position={[
                joint.origin.translation[0] / 1000,
                joint.origin.translation[1] / 1000,
                joint.origin.translation[2] / 1000
              ]}
            rotation={[
                joint.origin.rotation[0],
                joint.origin.rotation[1],
                joint.origin.rotation[2]
            ]}>
            {/* Joint visual */}
            {/* <GLTFMesh src={joint.mesh} /> */}
            <mesh>
                <boxGeometry args={[0.01,0.01,0.01]}/>
                <meshNormalMaterial />
            </mesh>
            {/* Rotating frame */}
            <group ref={jointRef} rotation={axisRotation}>
                <LinkMesh link={link} />
                {children}
            </group>
        </group>
    )
}
  
function LinkMesh({ link }) {
    if (!link.mesh) return null
    return (
        // <GLTFMesh
        //     src={link.mesh}
        //     name={link.id}
        // />
        <mesh >
            <boxGeometry args={[0.005,link.length/1000,0.005]}/>
            <meshBasicMaterial color={link.color}/>
        </mesh>
    )
}
  
function JointChain({ joint, config, jointValueById }) {
    const link = config.links.find(l => l.id === joint.child)
    if (!link) return null
    const nextJoint = config.joints.find(j => j.parent === link.id)
    return (
        <JointNode joint={joint} link={link} value={jointValueById[joint.id] || 0}>
            {nextJoint && (
                <JointChain
                    joint={nextJoint}
                    config={config}
                    jointValueById={jointValueById}
                />
            )}
        </JointNode>
    )
}

  
export default Robot