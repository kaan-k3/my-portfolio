import { useState, useRef, useEffect, useCallback } from 'react';

async function loadThreeDeps() {
  const THREE = await import(/* @vite-ignore */ 'three');
  const { OrbitControls } = await import(
    /* @vite-ignore */ 'three/addons/controls/OrbitControls.js'
  );
  const { GLTFLoader } = await import(
    /* @vite-ignore */ 'three/addons/loaders/GLTFLoader.js'
  );
  const { VRMLLoader } = await import(
    /* @vite-ignore */ 'three/addons/loaders/VRMLLoader.js'
  );
  return { THREE, OrbitControls, GLTFLoader, VRMLLoader };
}

function createViewer(container, url, opts) {
  const { interactive, THREE, OrbitControls, GLTFLoader, VRMLLoader } = opts;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  if (!interactive) {
    renderer.domElement.style.pointerEvents = 'none';
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    30, container.clientWidth / container.clientHeight, 0.001, 10000
  );
  camera.position.set(0, 80, 50);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir1 = new THREE.DirectionalLight(0xffffff, 1.0);
  dir1.position.set(5, 10, 5);
  scene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
  dir2.position.set(-3, 6, -3);
  scene.add(dir2);

  let controls = null;
  if (interactive) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 1000;
  }

  const isGLB = url.endsWith('.glb') || url.endsWith('.gltf');
  const loader = isGLB ? new GLTFLoader() : new VRMLLoader();

  loader.load(url, (result) => {
    const obj = isGLB ? result.scene : result;
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center);
    scene.add(obj);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const margin = interactive ? 1.2 : 1.3;
    const dist = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * margin;
    camera.position.set(0, dist * 0.5, dist);
    camera.lookAt(0, 0, 0);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  });

  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    if (controls) controls.dispose();
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}

function ThreeViewer({ url, interactive = false }) {
  const ref = useRef(null);

  useEffect(() => {
    let cleanup = null;
    let disposed = false;

    loadThreeDeps().then((deps) => {
      if (disposed || !ref.current) return;
      cleanup = createViewer(ref.current, url, { interactive, ...deps });
    });

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, [url, interactive]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
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
          <ThreeViewer url={url} interactive={false} />
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
              Close
            </button>
          </div>

          <div style={{ flex: 1, cursor: 'grab', minHeight: 0 }}>
            <ThreeViewer url={url} interactive={true} />
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
