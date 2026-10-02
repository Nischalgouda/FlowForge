// APINode.jsx — inline styles

import { useState } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';

const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };
const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #D9D2C5', outline: 'none', fontSize: 12, color: '#0F131A', padding: '3px 0', fontFamily: "'Inter', sans-serif" };

export const APINode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl]       = useState(data?.url || '');

  return (
    <BaseNode id={id} data={data} title="API Request" iconType="api"
      inputs={[{ id: `${id}-in`, label: 'payload' }]}
      outputs={[{ id: `${id}-response`, label: 'response' }, { id: `${id}-error`, label: 'error' }]}
      minWidth={250}>
      <div>
        <label style={lbl}>Method</label>
        <CustomSelect value={method} onChange={setMethod} options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH']} />
      </div>
      <div>
        <label style={lbl}>Endpoint URL</label>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)}
          style={{ ...inp, fontFamily: 'monospace', fontSize: 11 }}
          placeholder="https://api.example.com/v1/run"
          onFocus={e => (e.target.style.borderBottomColor = '#584824')}
          onBlur={e  => (e.target.style.borderBottomColor = '#D9D2C5')} />
      </div>
    </BaseNode>
  );
};
