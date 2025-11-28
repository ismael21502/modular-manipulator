import React from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
export function Model({ url, angles, opening }) {
  const { scene } = useGLTF(url);
  const degToRad = (deg) => deg * Math.PI / 180;
  useEffect(() => {
    const maxOpeningDeg = 63 / 100
    // Accede a las partes del modelo
    const J1 = scene.getObjectByName("J1")
    const J2 = scene.getObjectByName("J2")
    const J3 = scene.getObjectByName("J3")
    const claw1 = scene.getObjectByName("DriveGear1")
    const claw2 = scene.getObjectByName("DriveGear2")
    const jaw1 = scene.getObjectByName("Jaw1")
    const jaw2 = scene.getObjectByName("Jaw2")
    const limb1 = scene.getObjectByName("Limb1")
    const limb2 = scene.getObjectByName("Limb2")

    // Aplica rotaciones como en tu ejemplo original
    if (J1) J1.rotation.y = degToRad(angles[0])
    if (J2) J2.rotation.x = degToRad(angles[1])
    if (J3) J3.rotation.x = degToRad(angles[2])

    // Rotaciones de la pinza
    if (claw1) claw1.rotation.z = degToRad(opening * maxOpeningDeg + 180) //Reemplazar por el angulo de la pinza
    if (claw2) claw2.rotation.z = degToRad(-opening * maxOpeningDeg) //Reemplazar por el angulo de la pinza
    if (jaw1) jaw1.rotation.z = degToRad(-opening * maxOpeningDeg + 180)
    if (jaw2) jaw2.rotation.z = degToRad(opening * maxOpeningDeg)
    if (limb1) limb1.rotation.z = degToRad(opening * maxOpeningDeg)
    if (limb2) limb2.rotation.z = degToRad(-opening * maxOpeningDeg)
  }, [scene, angles, opening])

  return <primitive object={scene} />;
}
function RobotModel({ angles, opening }) {
  const {colors} = useTheme()
  const max_X = 10
  const max_Y = 10
  const max_Z = 10
  return (
    <div className='flex flex-1 h-full border-x-1 border-solid'
    style={{borderColor: colors.border}}>

      <Canvas camera={{ position: [0, 1, 3], fov: 70 }}>
        {/* Luz ambiental básica */}
        <ambientLight intensity={0.01} />

        {/* Luz de entorno tipo "Material Preview" */}
        <Environment preset="city" />
        {/* Grid de 20x20 con líneas cada 1 unidad */}
        <gridHelper args={[max_X, max_Y, '#9e9e9e', '#9e9e9e']} />
        <mesh>
          <boxGeometry args={[max_X, max_Y, max_Z]} />
          <meshBasicMaterial color="#666" wireframe opacity={0.2} transparent />
        </mesh>

        {/* Ejes XYZ */}
        <axesHelper args={[1.5]} />




        <Model url="/RobotCompleto.glb" angles={angles} opening={opening} />
        <OrbitControls />
      </Canvas>




    </div>
  );
}

export default RobotModel;
