import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Bounds, useBounds, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function GLBModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function VRMLModel({ url }) {
  const scene = useLoader(VRMLLoader, url);
  return <primitive object={scene} />;
}

function Model({ url }) {
  const isGLB = url.endsWith('.glb') || url.endsWith('.gltf');
  return isGLB ? <GLBModel url={url} /> : <VRMLModel url={url} />;
}

function FitToView({ children }) {
  const bounds = useBounds();
  useEffect(() => {
    bounds.refresh().clip().fit();
  }, [bounds]);
  return <>{children}</>;
}

function StaticPreview({ url }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 30, near: 0.001, far: 10000, position: [0, 80, 50] }}
      style={{ pointerEvents: 'none' }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />
      <directionalLight position={[-3, 6, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.3}>
          <FitToView>
            <Center>
              <Model url={url} />
            </Center>
          </FitToView>
        </Bounds>
      </Suspense>
    </Canvas>
  );
}

export default function PCBViewer({ url, title, description }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div
        className="rounded-xl border border-white/10 overflow-hidden bg-black/40
                   cursor-pointer group transition-all hover:border-white/20"
        onClick={open}
      >
        <div className="relative w-full" style={{ height: '280px' }}>
          <StaticPreview url={url} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all
                          flex items-center justify-center opacity-0 group-hover:opacity-100"
               style={{ pointerEvents: 'none' }}>
            <span className="px-4 py-2 text-sm font-mono bg-black/70 border border-white/20
                           rounded-lg text-white/80 backdrop-blur-sm">
              Click to interact in 3D
            </span>
          </div>
        </div>
        {(title || description) && (
          <div className="px-4 py-3 border-t border-white/[0.06]">
            {title && <p className="text-sm font-semibold text-white/80" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</p>}
            {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
          </div>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
            background: '#000',
          }}>
            <div>
              {title && <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{title}</p>}
              {description && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{description}</p>}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); close(); }}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ flex: 1, cursor: 'grab', minHeight: 0 }}>
            <Canvas
              dpr={[1, 1.5]}
              camera={{ fov: 30, near: 0.001, far: 10000, position: [0, 80, 50] }}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 10, 5]} intensity={1.0} />
              <directionalLight position={[-3, 6, -3]} intensity={0.3} />
              <Suspense fallback={null}>
                <Bounds fit clip observe margin={1.2}>
                  <FitToView>
                    <Center>
                      <Model url={url} />
                    </Center>
                  </FitToView>
                </Bounds>
              </Suspense>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                enableDamping={false}
                minDistance={0.1}
                maxDistance={1000}
              />
            </Canvas>
          </div>

          <div style={{
            padding: '8px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
            flexShrink: 0,
            background: '#000',
          }}>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)' }}>
              Drag to rotate · Scroll to zoom · Right-click to pan · Esc to close
            </span>
          </div>
        </div>
      )}
    </>
  );
}