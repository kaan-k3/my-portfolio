import { useState, useRef, Suspense } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';

function PCBModel({ url, autoRotate }) {
  const scene = useLoader(VRMLLoader, url);
  const groupRef = useRef();

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

function LoadingSpinner() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.05]} />
      <meshStandardMaterial color="#7dd3fc" opacity={0.3} transparent />
    </mesh>
  );
}

function Scene({ url, autoRotate }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={40} />
      <Suspense fallback={<LoadingSpinner />}>
        <PCBModel url={url} autoRotate={autoRotate} />
      </Suspense>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        autoRotate={false}
      />
    </>
  );
}

export default function PCBViewer({ url, title, description }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      {/* Inline preview */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30">
        <div
          className="relative w-full cursor-grab active:cursor-grabbing"
          style={{ height: '320px' }}
        >
          <Canvas dpr={[1, 2]}>
            <Scene url={url} autoRotate={true} />
          </Canvas>

          {/* Expand button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 px-3 py-1.5 text-xs font-mono
                       bg-black/60 border border-white/15 rounded-lg text-white/60
                       hover:text-white hover:border-white/30 transition-all
                       backdrop-blur-sm cursor-pointer z-10"
          >
            ⛶ Expand
          </button>

          {/* Drag hint */}
          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/25 select-none">
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        {/* Caption below viewer */}
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

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
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
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 text-sm font-mono bg-white/5 border border-white/15
                         rounded-lg text-white/60 hover:text-white hover:border-white/30
                         transition-all cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Full viewer */}
          <div className="flex-1 cursor-grab active:cursor-grabbing">
            <Canvas dpr={[1, 2]}>
              <Scene url={url} autoRotate={false} />
            </Canvas>
          </div>

          {/* Footer hint */}
          <div className="px-6 py-3 border-t border-white/[0.06] text-center">
            <span className="text-xs font-mono text-white/25">
              Drag to rotate · Scroll to zoom · Right-click to pan · Click outside to close
            </span>
          </div>
        </div>
      )}
    </>
  );
}
