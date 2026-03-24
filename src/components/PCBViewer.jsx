import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';

function PCBModel({ url, autoRotate }) {
  const scene = useLoader(VRMLLoader, url);
  const groupRef = useRef();
  const { camera } = useThree();

  // Auto-fit camera to model bounds on load
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 2.2;
    camera.position.set(center.x + dist * 0.5, center.y + dist * 0.6, center.z + dist);
    camera.lookAt(center);
    camera.near = 0.01;
    camera.far = dist * 10;
    camera.updateProjectionMatrix();
  }, [scene, camera]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

function LoadingIndicator() {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * 2;
  });
  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[0.3, 0.4, 24]} />
      <meshBasicMaterial color="#7dd3fc" opacity={0.4} transparent />
    </mesh>
  );
}

function Scene({ url, autoRotate }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <Suspense fallback={<LoadingIndicator />}>
        <PCBModel url={url} autoRotate={autoRotate} />
      </Suspense>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.5}
        maxDistance={500}
      />
    </>
  );
}

export default function PCBViewer({ url, title, description }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close fullscreen on Escape key
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  return (
    <>
      {/* Inline preview */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30">
        <div
          className="relative w-full cursor-grab active:cursor-grabbing"
          style={{ height: '320px' }}
        >
          <Canvas dpr={[1, 2]} camera={{ fov: 40, near: 0.01, far: 5000 }}>
            <Scene url={url} autoRotate={true} />
          </Canvas>

          {/* Expand button - pointer-events ensures it's clickable above canvas */}
          <div className="absolute top-3 right-3 z-20" style={{ pointerEvents: 'auto' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              className="px-3 py-1.5 text-xs font-mono
                         bg-black/70 border border-white/15 rounded-lg text-white/60
                         hover:text-white hover:border-white/30 transition-all
                         backdrop-blur-sm cursor-pointer"
            >
              ⛶ Expand
            </button>
          </div>

          {/* Drag hint */}
          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/25 select-none z-20"
               style={{ pointerEvents: 'none' }}>
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        {/* Caption */}
        {(title || description) && (
          <div className="px-4 py-3 border-t border-white/[0.06]">
            {title && (
              <p className="text-sm font-semibold text-white/80" style={{ fontFamily: 'Syne, sans-serif' }}>
                {title}
              </p>
            )}
            {description && (
              <p className="text-xs text-white/40 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen overlay - rendered in portal-like fashion */}
      {isFullscreen && (
        <div
          className="fixed inset-0 flex flex-col"
          style={{ zIndex: 99999, background: 'rgba(0,0,0,0.94)' }}
        >
          {/* Header bar - not part of canvas click area */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0"
               style={{ pointerEvents: 'auto' }}>
            <div>
              {title && (
                <p className="text-lg font-semibold text-white/90" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {title}
                </p>
              )}
              {description && (
                <p className="text-sm text-white/40">{description}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFullscreen(false);
              }}
              className="px-4 py-2 text-sm font-mono bg-white/10 border border-white/20
                         rounded-lg text-white/80 hover:text-white hover:bg-white/15
                         hover:border-white/30 transition-all cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Canvas area */}
          <div className="flex-1 cursor-grab active:cursor-grabbing">
            <Canvas dpr={[1, 2]} camera={{ fov: 40, near: 0.01, far: 5000 }}>
              <Scene url={url} autoRotate={false} />
            </Canvas>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/[0.06] text-center shrink-0"
               style={{ pointerEvents: 'none' }}>
            <span className="text-xs font-mono text-white/25">
              Drag to rotate · Scroll to zoom · Right-click to pan · Esc to close
            </span>
          </div>
        </div>
      )}
    </>
  );
}