import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Bounds, useBounds } from '@react-three/drei';
import * as THREE from 'three';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';

/* ────────────────────────────────────────────────
   Scene internals (only used in fullscreen viewer)
   ──────────────────────────────────────────────── */

function FitToView({ children }) {
  const bounds = useBounds();
  useEffect(() => { bounds.refresh().clip().fit(); }, [bounds]);
  return <>{children}</>;
}

function PCBModel({ url }) {
  const scene = useLoader(VRMLLoader, url);
  return <primitive object={scene} />;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <directionalLight position={[-3, 6, -3]} intensity={0.4} />
      <directionalLight position={[0, -5, 5]} intensity={0.15} />
    </>
  );
}

/* ────────────────────────────────────────────────
   Loading spinner for fullscreen viewer
   ──────────────────────────────────────────────── */

function LoadingSpinner() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      pointerEvents: 'none',
      zIndex: 2,
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '2px solid rgba(255,255,255,0.08)',
        borderTopColor: 'rgba(125,211,252,0.6)',
        borderRadius: '50%',
        animation: 'pcb-spin 0.8s linear infinite',
      }} />
      <span style={{
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.5px',
      }}>Loading 3D model…</span>
      <style>{`@keyframes pcb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Interactive fullscreen canvas
   ──────────────────────────────────────────────── */

function InteractiveCanvas({ url, controlsRef, onInteract }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 30, near: 0.001, far: 10000, position: [0, 80, 50] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <Lights />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15}>
          <FitToView>
            <Center>
              <PCBModel url={url} />
            </Center>
          </FitToView>
        </Bounds>
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enablePan enableZoom enableRotate enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
        panSpeed={0.6}
        minDistance={0.1}
        maxDistance={1000}
        onChange={onInteract}
      />
    </Canvas>
  );
}

/* ────────────────────────────────────────────────
   Topbar button styles
   ──────────────────────────────────────────────── */

const btnBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '6px 13px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.2s',
};

const closeBtnStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '16px',
  color: 'rgba(255,255,255,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  padding: 0,
  lineHeight: 1,
};

/* ────────────────────────────────────────────────
   Fullscreen overlay (portaled to <body>)
   ──────────────────────────────────────────────── */

function FullscreenOverlay({ url, title, onClose }) {
  const [hintsVisible, setHintsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const controlsRef = useRef(null);

  const onInteract = useCallback(() => {
    if (hintsVisible) setHintsVisible(false);
  }, [hintsVisible]);

  const resetCamera = useCallback(() => {
    if (controlsRef.current) controlsRef.current.reset();
  }, []);

  // Escape to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Hide loading after a delay (model loads via Suspense)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Topbar — blocks pointer events from reaching canvas */}
      <div
        onPointerDown={stopPropagation}
        onMouseDown={stopPropagation}
        onTouchStart={stopPropagation}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(12,12,20,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.3px',
          }}>{title || '3D Model'}</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>KiCad 3D Model</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={resetCamera}
            style={btnBase}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = btnBase.background; e.currentTarget.style.color = btnBase.color; }}
          >Reset</button>
          <button
            onClick={onClose}
            style={closeBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = closeBtnStyle.color; }}
          >✕</button>
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0c0c14' }}>
        {loading && <LoadingSpinner />}
        <InteractiveCanvas url={url} controlsRef={controlsRef} onInteract={onInteract} />

        {/* Hints pill */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '18px',
          padding: '9px 20px',
          borderRadius: '99px',
          background: 'rgba(12,12,20,0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.07)',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          pointerEvents: 'none',
          transition: 'opacity 0.5s',
          opacity: hintsVisible ? 1 : 0,
          whiteSpace: 'nowrap',
        }}>
          {[['Drag', 'Rotate'], ['Scroll', 'Zoom'], ['Right drag', 'Pan']].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px',
                padding: '1px 5px',
                fontSize: '10px',
              }}>{key}</kbd> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Main PCBViewer component

   Props:
     url        - path to .wrl 3D model
     thumbnail  - path to static thumbnail image
     title      - display title
     description - subtitle text
   ──────────────────────────────────────────────── */

export default function PCBViewer({ url, thumbnail, title, description }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ──── Static thumbnail card ──── */}
      <div
        onClick={open}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#0c0c14',
          cursor: 'pointer',
          border: '1.5px solid rgba(255,255,255,0.08)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(125,211,252,0.3)';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(125,211,252,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Static thumbnail image */}
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title || '3D PCB Model'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        {/* Label overlay at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          fontFamily: 'JetBrains Mono, monospace',
          pointerEvents: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Click to explore 3D model
        </div>

        {/* Title bar */}
        {(title || description) && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
            pointerEvents: 'none',
          }}>
            <div>
              {title && <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'Syne, sans-serif' }}>{title}</span>}
              {description && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginLeft: '10px' }}>{description}</span>}
            </div>
          </div>
        )}
      </div>

      {/* ──── Fullscreen overlay — portaled to <body> ──── */}
      {isOpen && createPortal(
        <FullscreenOverlay url={url} title={title} onClose={close} />,
        document.body
      )}
    </>
  );
}
