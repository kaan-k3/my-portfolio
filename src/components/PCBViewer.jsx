import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';

function PCBModel({ url, interactive }) {
  const scene = useLoader(VRMLLoader, url);
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    // Position camera at a nice isometric-ish angle, close in
    const dist = maxDim * 1.4;
    camera.position.set(center.x + dist * 0.3, center.y + dist * 0.8, center.z + dist * 0.5);
    camera.lookAt(center);
    camera.near = 0.001;
    camera.far = dist * 20;
    camera.updateProjectionMatrix();
  }, [scene, camera]);

  return (
    <>
      <Center>
        <primitive object={scene} />
      </Center>
      {interactive && (
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.1}
          maxDistance={500}
        />
      )}
    </>
  );
}

function LoadingIndicator() {
  return (
    <mesh>
      <ringGeometry args={[0.15, 0.2, 24]} />
      <meshBasicMaterial color="#7dd3fc" opacity={0.3} transparent />
    </mesh>
  );
}

// Static thumbnail - no orbit controls, no interaction
function StaticScene({ url }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />
      <directionalLight position={[-3, 6, -3]} intensity={0.3} />
      <Suspense fallback={<LoadingIndicator />}>
        <PCBModel url={url} interactive={false} />
      </Suspense>
    </>
  );
}

// Interactive fullscreen scene
function InteractiveScene({ url }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />
      <directionalLight position={[-3, 6, -3]} intensity={0.3} />
      <Suspense fallback={<LoadingIndicator />}>
        <PCBModel url={url} interactive={true} />
      </Suspense>
    </>
  );
}

export default function PCBViewer({ url, title, description }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openFullscreen = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreen(true);
  }, []);

  const closeFullscreen = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreen(false);
  }, []);

  // Escape key to close
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  return (
    <>
      {/* Static thumbnail preview */}
      <div
        className="rounded-xl border border-white/10 overflow-hidden bg-black/30
                   cursor-pointer group transition-all hover:border-white/20"
        onClick={openFullscreen}
      >
        <div className="relative w-full" style={{ height: '280px' }}>
          <Canvas
            dpr={[1, 2]}
            camera={{ fov: 35, near: 0.001, far: 5000 }}
            style={{ pointerEvents: 'none' }}
          >
            <StaticScene url={url} />
          </Canvas>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all
                          flex items-center justify-center opacity-0 group-hover:opacity-100"
               style={{ pointerEvents: 'none' }}>
            <span className="px-4 py-2 text-sm font-mono bg-black/70 border border-white/20
                           rounded-lg text-white/80 backdrop-blur-sm">
              Click to interact in 3D
            </span>
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

      {/* Fullscreen interactive overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 flex flex-col"
          style={{ zIndex: 99999, background: 'rgba(0,0,0,0.96)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
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
              onClick={closeFullscreen}
              className="px-4 py-2 text-sm font-mono bg-white/10 border border-white/20
                         rounded-lg text-white/80 hover:text-white hover:bg-white/15
                         hover:border-white/30 transition-all cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Interactive 3D canvas */}
          <div className="flex-1 cursor-grab active:cursor-grabbing">
            <Canvas dpr={[1, 2]} camera={{ fov: 35, near: 0.001, far: 5000 }}>
              <InteractiveScene url={url} />
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