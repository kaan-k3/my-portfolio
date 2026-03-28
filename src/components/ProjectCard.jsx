import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ────────────────────────────────────────────────
   Expandable Project Card with Modal

   Click card → modal expands with hero image + details
   Click "View full project →" → navigates to project page
   ──────────────────────────────────────────────── */

function Modal({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'modalFadeIn 0.25s ease',
      }}
    >
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '20px',
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'modalSlideIn 0.3s ease',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >✕</button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function ProjectCard({
  title,
  subtitle,
  description,
  tags = [],
  thumbnail,
  thumbnailAlt,
  thumbnailBadge,
  logo,
  logoAlt,
  logoClass = '',
  contextTag,
  contextType = 'team',
  href,
  // Modal-specific content
  modalDescription,
  highlights = [],
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((e) => {
    e.preventDefault();
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ──── Card ──── */}
      <div
        onClick={open}
        className="glass-card group overflow-hidden cursor-pointer"
      >
        {/* Thumbnail */}
        {thumbnail && (
          <div className="relative aspect-[16/9] overflow-hidden bg-[#0c0c14]">
            <img
              src={thumbnail}
              alt={thumbnailAlt || title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {thumbnailBadge && (
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span className="text-[10px] font-mono text-white/50">{thumbnailBadge}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {logo && (
                <img src={logo} alt={logoAlt || title} className={`w-9 h-9 rounded-md mt-0.5 object-contain ${logoClass}`} />
              )}
              <div>
                <h4 className="font-display font-semibold text-white/85">{title}</h4>
                {subtitle && <p className="text-xs font-mono text-white/30 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {contextTag && (
              <span className={`context-tag context-tag--${contextType}`}>{contextTag}</span>
            )}
          </div>
          <p className="text-sm text-white/50 leading-relaxed mb-3">{description}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag) => (
              <span key={tag} className="tech-tag">{tag}</span>
            ))}
          </div>
          <span className="detail-link group-hover:opacity-100">Click to view full details ›</span>
        </div>
      </div>

      {/* ──── Expansion Modal ──── */}
      {isOpen && (
        <Modal onClose={close}>
          {/* Hero image */}
          {thumbnail && (
            <div className="relative aspect-[16/9] overflow-hidden bg-[#0c0c14]" style={{ borderRadius: '20px 20px 0 0' }}>
              <img
                src={thumbnail}
                alt={thumbnailAlt || title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '24px 28px 28px' }}>
            {/* Context + title */}
            {contextTag && (
              <span className={`context-tag context-tag--${contextType}`} style={{ marginBottom: '10px', display: 'inline-block' }}>{contextTag}</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              {logo && (
                <img src={logo} alt={logoAlt || title} className={logoClass} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }} />
              )}
              <h3 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                lineHeight: 1.2,
              }}>{title}</h3>
            </div>
            {subtitle && (
              <p style={{
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '16px',
              }}>{subtitle}</p>
            )}

            {/* Description */}
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7,
              marginBottom: '16px',
            }}>{modalDescription || description}</p>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                {highlights.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '10px',
                  }}>
                    <span style={{
                      flexShrink: 0,
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.4)',
                      marginTop: '7px',
                    }} />
                    <span style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.6,
                    }}>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5" style={{ marginBottom: '24px' }}>
              {tags.map((tag) => (
                <span key={tag} className="tech-tag">{tag}</span>
              ))}
            </div>

            {/* CTA button */}
            {href && (
              <a
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
              >
                View full project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
