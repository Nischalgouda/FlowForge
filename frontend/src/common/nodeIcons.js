// nodeIcons.js — Inline SVG icons for all 9 node types (stroke-based, Lucide-style)

const SVG_DEFAULTS = {
  fill: 'none',
  stroke: '#584824',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/* ── Individual icon SVGs ───────────────────────────────────────── */

const InputSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
    <polyline points="8 11 12 15 16 11" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const OutputSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <path d="M21 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4" />
    <polyline points="16 13 12 9 8 13" />
    <line x1="12" y1="9" x2="12" y2="21" />
  </svg>
);

const LLMSvg = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="15" x2="4" y2="15" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="15" x2="23" y2="15" />
  </svg>
);

const TextSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="13" y1="17" x2="8" y2="17" />
  </svg>
);

const DatabaseSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const APISVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const FilterSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ValidatorSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const TransformSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...SVG_DEFAULTS}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

/* ── Icon map ──────────────────────────────────────────────────── */
export const ICON_MAP = {
  input:     InputSVG,
  output:    OutputSVG,
  llm:       LLMSvg,
  text:      TextSVG,
  database:  DatabaseSVG,
  api:       APISVG,
  filter:    FilterSVG,
  validator: ValidatorSVG,
  transform: TransformSVG,
};

/**
 * NodeIcon — renders the correct SVG inside an #EDE9DC pill.
 * size: 'sm' (node header, 16px icon / 28px pill) | 'lg' (toolbar tile, 22px icon / 40px pill)
 */
export const NodeIcon = ({ type, size = 'sm' }) => {
  const Icon = ICON_MAP[type] || InputSVG;
  const iconPx  = size === 'lg' ? 22 : 16;
  const pillPx  = size === 'lg' ? 40 : 28;

  return (
    <div
      style={{
        width: pillPx,
        height: pillPx,
        background: '#EDE9DC',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={iconPx} />
    </div>
  );
};

/* ── Standalone SVG export for one-off use (e.g. modal bolt) ──── */
export const BoltIcon = ({ size = 18, color = '#584824' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const CheckIcon = ({ size = 18, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const WarningIcon = ({ size = 18, color = '#F59E0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const CloseIcon = ({ size = 16, color = '#88867D' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const PlayIcon = ({ size = 14, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
    stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
