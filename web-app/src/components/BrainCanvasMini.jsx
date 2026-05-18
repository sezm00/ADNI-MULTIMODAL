import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

const BrainModelMini = () => {
  const groupRef = useRef();
  const gltf = useLoader(GLTFLoader, '/brain.glb');
  // The cached gltf.scene is a single Object3D — another mount (e.g. the AI
  // Diagnosis results brain) would re-parent it and this canvas would render
  // empty when navigating back. Clone so this component owns its own copy.
  const scene = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.3;
      groupRef.current.position.y = Math.sin(time * 0.6) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} scale={4.8} />
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={1} color="#ffffff" />
      <directionalLight position={[0, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 10]} intensity={0.9} color="#ffe0d0" />
      <pointLight position={[5, 0, 0]} intensity={0.6} color="#ffd0bc" />
      <pointLight position={[-5, 0, 0]} intensity={0.5} color="#ffc8a8" />
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
