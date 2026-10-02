import { useState, useRef, useEffect } from 'react';

export const CustomSelect = ({ value, onChange, options, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  const normOptions = options.map(o => typeof o === 'string' ? { label: o, value: o } : o);
  const currentLabel = normOptions.find(o => o.value === value)?.label || value;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', background: 'transparent',
          borderBottom: `1px solid ${isOpen ? '#584824' : '#D9D2C5'}`,
          fontSize: 12, color: '#0F131A', padding: '3px 0',
          fontFamily: "'Inter', sans-serif", cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <span>{currentLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      
      {isOpen && (
        <div 
          className="nodrag nowheel"
          style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: '#FFFEFB', border: '1px solid #D9D2C5', borderRadius: 4,
          boxShadow: '0 4px 12px rgba(15,19,26,0.1)', marginTop: 4,
          maxHeight: 120, overflowY: 'auto'
        }}>
          {normOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '6px 10px', fontSize: 11, fontFamily: "'Inter', sans-serif",
                cursor: 'pointer', color: value === opt.value ? '#584824' : '#0F131A',
                background: value === opt.value ? '#F5F2E8' : 'transparent',
                fontWeight: value === opt.value ? 600 : 400
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F2E8'}
              onMouseLeave={e => e.currentTarget.style.background = value === opt.value ? '#F5F2E8' : 'transparent'}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
