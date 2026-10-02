// TransformNode.jsx — inline styles

import { useState } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';

const TRANSFORMS = [
  { label: 'To Uppercase',    value: 'uppercase'   },
  { label: 'To Lowercase',    value: 'lowercase'   },
  { label: 'Trim Whitespace', value: 'trim'        },
  { label: 'Parse JSON',      value: 'parse-json'  },
  { label: 'Stringify JSON',  value: 'stringify'   },
  { label: 'Base64 Encode',   value: 'b64-encode'  },
  { label: 'Base64 Decode',   value: 'b64-decode'  },
  { label: 'Custom Script',   value: 'custom'      },
];
const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };
const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #D9D2C5', outline: 'none', fontSize: 12, color: '#0F131A', padding: '3px 0', fontFamily: "'Inter', sans-serif", cursor: 'pointer' };
const ta  = { width: '100%', background: '#FFFEFB', border: '1px solid #D9D2C5', borderRadius: 4, outline: 'none', fontSize: 11, color: '#0F131A', padding: '6px 8px', fontFamily: 'monospace', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' };

export const TransformNode = ({ id, data }) => {
  const [transform, setTransform] = useState(data?.transform || 'uppercase');
  const [script, setScript]       = useState(data?.script || '');

  return (
    <BaseNode id={id} data={data} title="Data Transform" iconType="transform"
      inputs={[{ id: `${id}-in`, label: 'raw' }]}
      outputs={[{ id: `${id}-out`, label: 'transformed' }]}
      minWidth={250}>
      <div>
        <label style={lbl}>Operation</label>
        <CustomSelect value={transform} onChange={setTransform} options={TRANSFORMS} />
      </div>
      {transform === 'custom' && (
        <div>
          <label style={lbl}>Script Body</label>
          <textarea value={script} onChange={e => setScript(e.target.value)} rows={3}
            style={ta} placeholder={'// input -> output\nreturn input.trim();'}
            onFocus={e => (e.target.style.borderColor = '#584824')}
            onBlur={e  => (e.target.style.borderColor = '#D9D2C5')} />
        </div>
      )}
    </BaseNode>
  );
};
