import React from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useRobotState } from '../../../context/RobotState';
// import AxisWidget from './AxisWidget';

export function Model({ url }) {
  const { scene } = useGLTF(url)
  const { joints } = useRobotState()
  const degToRad = (deg) => deg * Math.PI / 180;
  useEffect(() => {
    const maxOpeningDeg = 77 / 100
    // Accede a las partes del modelo
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

    // Aplica rotaciones como en tu ejemplo original
    if (J1) J1.rotation.y = degToRad(joints[0]+90) //[ ] Este offset no debería existir
    if (J2) J2.rotation.x = degToRad(joints[1])
    if (J3) J3.rotation.x = degToRad(joints[2])
    if (J4) J4.rotation.x = degToRad(joints[3])
    const clawRotation = joints[joints.length - 1]
    // Rotaciones de la pinza
    if (claw1) claw1.rotation.y = degToRad(-clawRotation * maxOpeningDeg  ) //Reemplazar por el angulo de la pinza
    if (claw2) claw2.rotation.y = degToRad(clawRotation * maxOpeningDeg) //Reemplazar por el angulo de la pinza
    if (jaw1) jaw1.rotation.y = degToRad(-clawRotation * maxOpeningDeg)
    if (jaw2) jaw2.rotation.y = degToRad(clawRotation * maxOpeningDeg)
    if (limb1) limb1.rotation.y = degToRad(clawRotation * maxOpeningDeg)
    if (limb2) limb2.rotation.y = degToRad(-clawRotation * maxOpeningDeg)
  }, [scene, joints])

  return <primitive object={scene} />;
}
function RobotModel({ }) {
  const {colors} = useTheme()
  const max_X = 1
  const max_Y = 1
  const max_Z = 1

  const gridSize = 1 //mts
  const divisionSize = 100 //mm
  const divisions = gridSize*(1000/divisionSize)
  return (
    <div className='flex flex-1 h-full border-x-1 border-solid'
    style={{borderColor: colors.border}}>

      <Canvas camera={{ position: [0, 0.2, 0.30], fov: 70 }}
        >
        {/* Luz ambiental básica */}
        <ambientLight intensity={0.01} />

        {/* Luz de entorno tipo "Material Preview" */}
        <Environment preset="city" />
        {/* Grid de 20x20 con líneas cada 1 unidad */}
        <gridHelper args={[gridSize, divisions, '#3c9439', '#9e9e9e']} />
        <mesh>
          <boxGeometry args={[max_X, max_Y, max_Z]} />
          <meshBasicMaterial color="#666" wireframe opacity={0.2} transparent />
        </mesh>

        {/* Ejes XYZ */}
        {/* <axesHelper args={[1.5]} /> */}

        <Model url="/Modbot.glb"/>
        <OrbitControls />
        
      </Canvas>




    </div>
  );
}

export default RobotModel;
