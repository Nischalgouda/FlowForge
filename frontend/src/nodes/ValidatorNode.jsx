// ValidatorNode.jsx — inline styles

import { useState } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';

const TYPES = [
  { label: 'Email',       value: 'email'    },
  { label: 'URL',         value: 'url'      },
  { label: 'Phone',       value: 'phone'    },
  { label: 'Number',      value: 'number'   },
  { label: 'Date',        value: 'date'     },
  { label: 'JSON',        value: 'json'     },
  { label: 'Non-empty',   value: 'non-empty'},
  { label: 'Custom Regex',value: 'regex'    },
];
const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };
const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #D9D2C5', outline: 'none', fontSize: 12, color: '#0F131A', padding: '3px 0', fontFamily: "'Inter', sans-serif" };

export const ValidatorNode = ({ id, data }) => {
  const [type, setType]   = useState(data?.validationType || 'email');
  const [regex, setRegex] = useState(data?.customRegex || '');

  return (
    <BaseNode id={id} data={data} title="Schema Validator" iconType="validator"
      inputs={[{ id: `${id}-in`, label: 'input' }]}
      outputs={[{ id: `${id}-valid`, label: 'valid' }, { id: `${id}-invalid`, label: 'invalid' }]}
      minWidth={250}>
      <div>
        <label style={lbl}>Validation Type</label>
        <CustomSelect value={type} onChange={setType} options={TYPES} />
      </div>
      {type === 'regex' && (
        <div>
          <label style={lbl}>Pattern</label>
          <input type="text" value={regex} onChange={e => setRegex(e.target.value)}
            style={{ ...inp, fontFamily: 'monospace', fontSize: 11 }}
            placeholder="^[a-zA-Z0-9]+$"
            onFocus={e => (e.target.style.borderBottomColor = '#584824')}
            onBlur={e  => (e.target.style.borderBottomColor = '#D9D2C5')} />
        </div>
      )}
    </BaseNode>
  );
};
