import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const BrainModelMini = () => {
  const groupRef = useRef();
  const gltf = useLoader(GLTFLoader, '/brain.glb');

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.3;
      groupRef.current.position.y = Math.sin(time * 0.6) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={gltf.scene} scale={4.8} />
      <ambientLight intensity={2.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.8} color="#e0f2fe" />
      <directionalLight position={[0, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 8]} intensity={1.0} color="#2dd4bf" />
      <pointLight position={[4, 0, 0]} intensity={0.6} color="#34d399" />
      <pointLight position={[-4, 0, 0]} intensity={0.4} color="#60a5fa" />
    </group>
  );
};

const BrainCanvasMini = () => {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 7], fov: 42 }}
        style={{ position: 'relative', zIndex: 10, background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <Suspense fallback={null}>
          <BrainModelMini />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.6}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BrainCanvasMini;
