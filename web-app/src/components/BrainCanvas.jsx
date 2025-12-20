import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const BrainModel = () => {
  const groupRef = useRef();
  const gltf = useLoader(GLTFLoader, '/brain.glb');

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.2;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <primitive object={gltf.scene} scale={5.2} />
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={1} color="#ffffff" />
      <directionalLight position={[0, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 10]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[5, 0, 0]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[-5, 0, 0]} intensity={0.5} color="#8b5cf6" />
    </group>
  );
};

const BrainCanvas = () => {
  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ position: 'relative', zIndex: 10 }}
      >
        <Suspense fallback={null}>
          <BrainModel />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BrainCanvas;
