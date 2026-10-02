// FilterNode.jsx — inline styles

import { useState } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';

const CONDITIONS = ['equals','not equals','contains','not contains','starts with','ends with','greater than','less than','is empty','is not empty'];
const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };
const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #D9D2C5', outline: 'none', fontSize: 12, color: '#0F131A', padding: '3px 0', fontFamily: "'Inter', sans-serif" };

export const FilterNode = ({ id, data }) => {
  const [field, setField]         = useState(data?.field || '');
  const [condition, setCondition] = useState(data?.condition || 'equals');
  const [value, setValue]         = useState(data?.value || '');
  const noValue = condition === 'is empty' || condition === 'is not empty';

  return (
    <BaseNode id={id} data={data} title="Condition Filter" iconType="filter"
      inputs={[{ id: `${id}-in`, label: 'input' }]}
      outputs={[{ id: `${id}-pass`, label: 'pass' }, { id: `${id}-fail`, label: 'fail' }]}
      minWidth={250}>
      <div>
        <label style={lbl}>Field</label>
        <input type="text" value={field} onChange={e => setField(e.target.value)} style={inp}
          placeholder="status"
          onFocus={e => (e.target.style.borderBottomColor = '#584824')}
          onBlur={e  => (e.target.style.borderBottomColor = '#D9D2C5')} />
      </div>
      <div>
        <label style={lbl}>Operator</label>
        <CustomSelect value={condition} onChange={setCondition} options={CONDITIONS} />
      </div>
      {!noValue && (
        <div>
          <label style={lbl}>Value</label>
          <input type="text" value={value} onChange={e => setValue(e.target.value)} style={inp}
            placeholder="active"
            onFocus={e => (e.target.style.borderBottomColor = '#584824')}
            onBlur={e  => (e.target.style.borderBottomColor = '#D9D2C5')} />
        </div>
      )}
    </BaseNode>
  );
};
