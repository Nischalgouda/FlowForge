// DatabaseNode.jsx — inline styles

import { useState } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';

const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };
const ta  = { width: '100%', background: '#FFFEFB', border: '1px solid #D9D2C5', borderRadius: 4, outline: 'none', fontSize: 11, color: '#0F131A', padding: '6px 8px', fontFamily: 'monospace', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' };

export const DatabaseNode = ({ id, data }) => {
  const [dbType, setDbType] = useState(data?.dbType || 'PostgreSQL');
  const [query, setQuery]   = useState(data?.query || '');

  return (
    <BaseNode id={id} data={data} title="Database Query" iconType="database"
      inputs={[{ id: `${id}-in`, label: 'params' }]}
      outputs={[{ id: `${id}-out`, label: 'rows' }]} minWidth={250}>
      <div>
        <label style={lbl}>Engine</label>
        <CustomSelect value={dbType} onChange={setDbType} options={['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB']} />
      </div>
      <div>
        <label style={lbl}>SQL Query</label>
        <textarea value={query} onChange={e => setQuery(e.target.value)} rows={3}
          style={ta} placeholder="SELECT * FROM users WHERE active = true;"
          onFocus={e => (e.target.style.borderColor = '#584824')}
          onBlur={e  => (e.target.style.borderColor = '#D9D2C5')} />
      </div>
    </BaseNode>
  );
};
