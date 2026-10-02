// BaseNode.jsx — node card (inline SVG icons, no emoji, clean CSS)

import { Handle, Position } from 'reactflow';
import { NodeIcon, CloseIcon } from './nodeIcons';
import { useStore } from '../store';

/**
 * BaseNode — universal wrapper for all node types.
 *
 * Props:
 *   id            — react-flow node id
 *   data          — react-flow node data
 *   title         — label in the node header
 *   iconType      — key into NODE_ICONS ('input'|'llm'|'output'|'text'|...)
 *   children      — node body content (fields, selects, etc.)
 *   inputs        — false | true | [{ id, label }]
 *   outputs       — false | true | [{ id, label }]
 *   minWidth      — number (default 240)
 */
export const BaseNode = ({
  id,
  data,
  title,
  iconType  = 'input',
  children,
  inputs    = true,
  outputs   = true,
  minWidth  = 240,
  selected  = false,
}) => {
  const removeNode = useStore(state => state.removeNode);
  const run = useStore(state => state.runState[id]);
  const RING = { running: '#D97706', done: '#059669', error: '#DC2626' };
  const normalise = (spec, fallbackId) => {
    if (!spec)       return [];
    if (spec === true) return [{ id: fallbackId }];
    return spec;
  };

  const inputHandles  = normalise(inputs,  `${id}-in`);
  const outputHandles = normalise(outputs, `${id}-out`);

  const getTop = (idx, total) =>
    total <= 1 ? '50%' : `${((idx + 1) / (total + 1)) * 100}%`;

  const handleStyle = {
    width: 10,
    height: 10,
    background: '#FBF9F4',
    border: '1.5px solid #88867D',
    borderRadius: '50%',
    transition: 'border-color 0.15s, background 0.15s',
  };

  return (
    <div
      style={{
        minWidth,
        fontFamily: "'Inter', sans-serif",
        background: '#FBF9F4',
        border: '1px solid #D9D2C5',
        borderRadius: 6,
        boxShadow: '0 1px 4px rgba(15,19,26,0.06)',
        position: 'relative',
        outline: run ? `2px solid ${RING[run.status]}` : 'none',
        outlineOffset: 2,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#584824';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(88,72,36,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#D9D2C5';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,19,26,0.06)';
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        style={{
          background: '#F5F2E8',
          padding: '10px 12px',
          borderBottom: '1px solid #D9D2C5',
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NodeIcon type={iconType} size="sm" />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: '#0F131A',
              lineHeight: 1,
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              fontSize: 9,
              color: '#88867D',
              background: '#EDE9DC',
              border: '1px solid #D9D2C5',
              borderRadius: 4,
              padding: '2px 6px',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              lineHeight: 1.4,
            }}
          >
            NODE
          </span>
          <button
            onClick={() => removeNode(id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#88867D',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#88867D'}
            title="Delete node"
          >
            <CloseIcon size={14} color="currentColor" />
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
        {run?.status === 'running' && (
          <div style={{ fontSize: 10, color: '#D97706', fontFamily: 'monospace' }}>Running…</div>
        )}
        {run?.status === 'error' && (
          <div style={{ fontSize: 10, color: '#DC2626', fontFamily: 'monospace' }}>{run.message}</div>
        )}
        {run?.status === 'done' && run.output !== '' && (
          <div
            className="nodrag nowheel"
            style={{
              fontSize: 10, color: '#065F46', fontFamily: 'monospace', whiteSpace: 'pre-wrap',
              background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 4,
              padding: '6px 8px', maxHeight: 120, overflow: 'auto',
            }}
          >
            {String(run.output)}
          </div>
        )}
      </div>

      {/* ── Input handles (left edge) ──────────────────────── */}
      {inputHandles.map((h, i) => (
        <Handle
          key={h.id}
          type="target"
          position={Position.Left}
          id={h.id}
          title={h.label || h.id}
          style={{ ...handleStyle, top: getTop(i, inputHandles.length), left: -5 }}
        />
      ))}

      {/* ── Output handles (right edge) ────────────────────── */}
      {outputHandles.map((h, i) => (
        <Handle
          key={h.id}
          type="source"
          position={Position.Right}
          id={h.id}
          title={h.label || h.id}
          style={{ ...handleStyle, top: getTop(i, outputHandles.length), right: -5 }}
        />
      ))}
    </div>
  );
};
