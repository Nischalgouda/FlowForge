// textNode.js — Text Template node with dynamic handles, inline styles

import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from '../common/BaseNode';
import { useStore } from '../store';

const VAR_REGEX = /\{\{\s*(\w+)\s*\}\}/g;

const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };

export const TextNode = ({ id, data }) => {
  const [text, setText]         = useState(data?.text || '');
  const [variables, setVars]    = useState([]);
  const textareaRef             = useRef(null);
  const update                  = useStore(s => s.updateNodeField);

  useEffect(() => {
    const matches = [...text.matchAll(VAR_REGEX)].map(m => m[1]);
    setVars([...new Set(matches)]);
  }, [text]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(72, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  const nodeWidth = Math.min(480, Math.max(260,
    Math.max(...(text.split('\n').map(l => l.length)), 20) * 7 + 60
  ));

  return (
    <div style={{ position: 'relative', width: nodeWidth }}>
      <BaseNode id={id} data={data} title="Text Template" iconType="text"
        inputs={false}
        outputs={[{ id: `${id}-output`, label: 'output' }]}
        minWidth={nodeWidth}>

        <div>
          <label style={lbl}>Template Prompt</label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); update(id, 'text', e.target.value); }}
            placeholder="Summarize this: {{user_query}}"
            style={{
              width: '100%', background: '#FFFEFB',
              border: '1px solid #D9D2C5', borderRadius: 4,
              outline: 'none', fontSize: 11, color: '#0F131A',
              padding: '6px 8px', fontFamily: 'monospace',
              resize: 'none', minHeight: 72, lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#584824')}
            onBlur={e  => (e.target.style.borderColor = '#D9D2C5')}
          />
        </div>

        {variables.length > 0 && (
          <div style={{ borderTop: '1px solid #D9D2C5', paddingTop: 8 }}>
            <span style={{ fontSize: 9, color: '#88867D', fontFamily: 'monospace', display: 'block', marginBottom: 4 }}>
              Variables detected:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {variables.map(v => (
                <span key={v} style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 4,
                  background: '#F5F2E8', color: '#584824',
                  border: '1px solid #D9D2C5', fontFamily: 'monospace',
                }}>
                  {'{{ '}{v}{' }}'}
                </span>
              ))}
            </div>
          </div>
        )}
      </BaseNode>

      {/* Per-variable input handles */}
      {variables.map((v, i) => (
        <Handle
          key={`${id}-var-${v}`}
          type="target"
          position={Position.Left}
          id={`${id}-${v}`}
          title={v}
          style={{
            top: `${52 + i * 24}px`,
            width: 10, height: 10,
            background: '#FBF9F4', border: '1.5px solid #88867D',
            borderRadius: '50%', left: -5,
          }}
        />
      ))}
    </div>
  );
};
