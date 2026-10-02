// inputNode.js — inline-style inputs

import { useState, useEffect } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';
import { useStore } from '../store';

const fieldLabel = {
  display: 'block', fontSize: 9, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  color: '#88867D', marginBottom: 4,
};
const fieldInput = {
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: '1px solid #D9D2C5',
  outline: 'none', fontSize: 12, color: '#0F131A',
  padding: '3px 0', fontFamily: "'Inter', sans-serif",
};

export const InputNode = ({ id, data }) => {
  const [name, setName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [type, setType] = useState(data?.inputType || 'Text');
  const [value, setValue] = useState(data?.value || '');
  const update = useStore(s => s.updateNodeField);
  const set = (field, setter) => v => { setter(v); update(id, field, v); };

  useEffect(() => {
    if (!data?.inputName) update(id, 'inputName', name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BaseNode id={id} data={data} title="Input" iconType="input"
      inputs={false} outputs={[{ id: `${id}-value`, label: 'value' }]}>
      <div>
        <label style={fieldLabel}>Variable Name</label>
        <input type="text" value={name} onChange={e => set('inputName', setName)(e.target.value)}
          style={fieldInput} placeholder="user_query"
          onFocus={e => (e.target.style.borderBottomColor = '#584824')}
          onBlur={e => (e.target.style.borderBottomColor = '#D9D2C5')} />
      </div>
      <div>
        <label style={fieldLabel}>Value (runtime input)</label>
        <textarea value={value} onChange={e => set('value', setValue)(e.target.value)}
          className="nodrag" rows={2} placeholder="Text passed into the pipeline"
          style={{ ...fieldInput, border: '1px solid #D9D2C5', borderRadius: 4, padding: '4px 6px', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={fieldLabel}>Type</label>
        <CustomSelect value={type} onChange={set('inputType', setType)} options={['Text', 'File', 'Number']} />
      </div>
    </BaseNode>
  );
};
