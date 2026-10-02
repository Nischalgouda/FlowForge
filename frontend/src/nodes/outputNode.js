// outputNode.js — inline styles

import { useState } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';
import { useStore } from '../store';

const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };
const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #D9D2C5', outline: 'none', fontSize: 12, color: '#0F131A', padding: '3px 0', fontFamily: "'Inter', sans-serif" };

export const OutputNode = ({ id, data }) => {
  const [name, setName]       = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setType] = useState(data?.outputType || 'Text');
  const update = useStore(s => s.updateNodeField);
  const set = (field, setter) => v => { setter(v); update(id, field, v); };

  return (
    <BaseNode id={id} data={data} title="Output" iconType="output"
      inputs={[{ id: `${id}-value`, label: 'value' }]} outputs={false}>
      <div>
        <label style={lbl}>Result Key</label>
        <input type="text" value={name} onChange={e => set('outputName', setName)(e.target.value)}
          style={inp} placeholder="summary_result"
          onFocus={e => (e.target.style.borderBottomColor = '#584824')}
          onBlur={e => (e.target.style.borderBottomColor = '#D9D2C5')} />
      </div>
      <div>
        <label style={lbl}>Format</label>
        <CustomSelect value={outputType} onChange={set('outputType', setType)} options={['Text', 'Image', 'File']} />
      </div>
    </BaseNode>
  );
};
