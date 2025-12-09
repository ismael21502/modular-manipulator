import { useThree, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function AxisWidget() {
    const { gl, camera, size } = useThree();

    // Mini escena + cámara
    const axesScene = useMemo(() => new THREE.Scene(), []);
    const axesCamera = useMemo(
        () => new THREE.PerspectiveCamera(50, 1, 0.1, 10),
        []
    );

    // Añadir axes una sola vez
    useMemo(() => {
        const axes = new THREE.AxesHelper(0.6);
        axesScene.add(axes);

        axesCamera.position.set(1, 1, 1);
        axesCamera.lookAt(0, 0, 0);
    }, []);

    useFrame(() => {
        // Copiar orientación de la cámara real
        axesCamera.quaternion.copy(camera.quaternion);

        // Vista normal
        gl.autoClear = false;

        // Mini viewport en esquina superior derecha
        const viewportSize = 100;
        gl.setViewport(size.width - viewportSize - 10, size.height - viewportSize - 10, viewportSize, viewportSize);
        gl.setScissor(size.width - viewportSize - 10, size.height - viewportSize - 10, viewportSize, viewportSize);
        gl.setScissorTest(true);

        gl.render(axesScene, axesCamera);
        gl.setScissorTest(false);
    });

    return null;
}
