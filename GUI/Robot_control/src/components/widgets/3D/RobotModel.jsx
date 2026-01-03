import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, GizmoHelper, GizmoViewport, Html, Billboard } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useRobotState } from '../../../context/RobotState';
import OrientationGizmo from './AxisWidget';
import CloseIcon from '@mui/icons-material/Close';
// import { GizmoOverlay } from './GizmoOverlay';
// import AxisWidget from './AxisWidget';

export function Model({ url }) {
  const { scene } = useGLTF(url)
  const state = useRobotState()

  const joints = state.robotState.joints
  const endEffectors = state.robotState.endEffectors

  const degToRad = (deg) => deg * Math.PI / 180;
  useEffect(() => {
    const maxOpeningDeg = 77 / 100
    const J1 = scene.getObjectByName("J1")
    const J2 = scene.getObjectByName("L1-H")
    const J3 = scene.getObjectByName("L2-H")
    const J4 = scene.getObjectByName("L3-H")
    const claw1 = scene.getObjectByName("GearLink1")
    const claw2 = scene.getObjectByName("GearLink2")
    const jaw1 = scene.getObjectByName("Hlink1")
    const jaw2 = scene.getObjectByName("Hlink2")
    const limb1 = scene.getObjectByName("Finger1")
    const limb2 = scene.getObjectByName("Finger2")

    if (J1) J1.rotation.y = degToRad(joints[0] - 90) //[ ] Este offset no debería existir
    if (J2) J2.rotation.x = degToRad(joints[1])
    if (J3) J3.rotation.x = degToRad(joints[2])
    if (J4) J4.rotation.x = degToRad(joints[3])
    // const clawRotation = joints[joints.length - 1]
    const clawRotation = endEffectors[0]
    if (claw1) claw1.rotation.y = degToRad(-clawRotation * maxOpeningDeg) //Reemplazar por el angulo de la pinza
    if (claw2) claw2.rotation.y = degToRad(clawRotation * maxOpeningDeg) //Reemplazar por el angulo de la pinza
    if (jaw1) jaw1.rotation.y = degToRad(-clawRotation * maxOpeningDeg)
    if (jaw2) jaw2.rotation.y = degToRad(clawRotation * maxOpeningDeg)
    if (limb1) limb1.rotation.y = degToRad(clawRotation * maxOpeningDeg)
    if (limb2) limb2.rotation.y = degToRad(-clawRotation * maxOpeningDeg)
  }, [scene, joints, endEffectors])

  return <primitive object={scene} />;
}

const TCPCursor = ({ color = null, position }) => {
  const { colors } = useTheme()
  if (!color) color = colors.primary
  return (
      <Html center position={position}>
        <div className="flex relative justify-center items-center w-7 h-7 rounded-full"
          style={{ backgroundColor: `${color}3A`, border: `2px dashed ${color}` }}>
          <div className="flex w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}>

          </div>
          <div className="flex absolute w-10 h-[2px] rounded-full"
            style={{ backgroundColor: color }}>

          </div>
          <div className="flex absolute w-[2px] h-10 rounded-full"
            style={{ backgroundColor: color }}>

          </div>
        </div>
      </Html>      
  )
}

function RobotModel({ }) {
  const { colors } = useTheme()
  const { cartesian } = useRobotState()
  const max_X = 1
  const max_Y = 1
  const max_Z = 1

  const gridSize = 2//mts
  const divisionSize = 100 //mm
  const divisions = gridSize * (1000 / divisionSize)
  return (
    <div className='flex relative flex-1 h-full border-x-1 border-solid'
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSubtle }}>

      <Canvas camera={{ position: [0, 0.2, 0.30], fov: 70 }}
      >
        <ambientLight intensity={0.01} />

        <Environment preset="city" />
        <gridHelper args={[gridSize, divisions, '#3c9439', '#9e9e9e']} />

        <Model url="/Modbot.glb" />
        <OrbitControls makeDefault />

        <TCPCursor position={[(cartesian[0] ?? 0) / 1000, (cartesian[2] ?? 0) / 1000, (cartesian[1] ?? 0) / 1000 * -1]} />

        <GizmoHelper alignment="top-right" margin={[65, 65]}>
          <OrientationGizmo size={10} />
          {/* <GizmoViewport /> */}
        </GizmoHelper>

      </Canvas>
      <div className="flex flex-col p-3 text-xs absolute top-5 left-5 rounded-lg"
        style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.background, color: colors.text.primary }}>
        <div className="flex justify-between items-center">
          <p style={{ color: colors.text.title, fontWeight: 'bold' }}>Controles 3D</p>
          {/* <button>
            <CloseIcon fontSize='small' color={colors.text.title} className={`hover:text-red-400 cursor-pointer`} />
          </button> */}
        </div>
        <div className='w-full my-1.5' style={{ height: "1px", backgroundColor: colors.border }} />

        <div className="flex flex-col">
          <p className='flex justify-between gap-5'>Rotar<span className='font-bold' style={{ color: colors.primaryDark }}>Arrastrar</span></p>
          <p className='flex justify-between gap-5'>Mover<span className='font-bold' style={{ color: colors.primaryDark }}>Arrastrar (der.)</span></p>
          <p className='flex justify-between gap-5'>Zoom<span className='font-bold' style={{ color: colors.primaryDark }}>Rueda </span></p>
        </div>
      </div>
    </div>
  );
}

export default RobotModel;
