import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * PhotoGallery — collage thumbnail that opens a fullscreen lightbox.
 *
 * Props:
 *   images  - array of { src, alt, caption? }
 *   columns - collage grid columns (default 2)
 */

function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const img = images[idx];

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const stop = (e) => e.stopPropagation();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Top bar */}
      <div
        onClick={stop}
        onPointerDown={stop}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
          zIndex: 10,
        }}
      >
        <span style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {idx + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          style={{
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
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >✕</button>
      </div>

      {/* Image */}
      <div onClick={stop} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh', cursor: 'default' }}>
        <img
          src={img.src}
          alt={img.alt || ''}
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '8px',
            display: 'block',
          }}
        />
      </div>

      {/* Caption */}
      {img.caption && (
        <p
          onClick={stop}
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'DM Sans, sans-serif',
            maxWidth: '600px',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >{img.caption}</p>
      )}

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && images.length <= 10 && (
        <div onClick={stop} style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === idx ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhotoGallery({ images = [], columns = 2 }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!images.length) return null;

  // Show up to 4 images in collage
  const collageImages = images.slice(0, 4);
  const remaining = images.length - 4;

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(columns, collageImages.length)}, 1fr)`,
          gap: '4px',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1.5px solid rgba(255,255,255,0.06)',
          transition: 'border-color 0.3s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
      >
        {collageImages.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightboxIdx(i)}
            style={{
              position: 'relative',
              aspectRatio: collageImages.length === 1 ? '16/9' : (i === 0 && collageImages.length === 3) ? '2/1' : '4/3',
              gridColumn: (i === 0 && collageImages.length === 3) ? '1 / -1' : undefined,
              overflow: 'hidden',
            }}
          >
            <img
              src={img.src}
              alt={img.alt || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            {/* "View photos" badge on first image */}
            {i === 0 && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '11px',
                fontWeight: 500,
                fontFamily: 'JetBrains Mono, monospace',
                pointerEvents: 'none',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                View photos · {images.length}
              </div>
            )}
            {/* +N overlay on last collage image */}
            {i === collageImages.length - 1 && remaining > 0 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
              }}>+{remaining}</div>
            )}
          </div>
        ))}
      </div>

      {lightboxIdx !== null && createPortal(
        <Lightbox
          images={images}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />,
        document.body
      )}
    </>
  );
}
