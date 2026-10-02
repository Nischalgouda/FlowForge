// llmNode.js — inline styles

import { useState, useEffect } from 'react';
import { BaseNode } from '../common/BaseNode';
import { CustomSelect } from '../common/CustomSelect';
import { useStore } from '../store';

const lbl = { display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 };

export const LLMNode = ({ id, data }) => {
  const [model, setModel] = useState(data?.model || 'Gemini 3.5 Flash');
  const [temp, setTemp]   = useState(data?.temperature ?? 0.7);
  const update = useStore(s => s.updateNodeField);

  // Persist defaults so the backend sees them even if the user never touches the controls.
  useEffect(() => {
    update(id, 'model', model);
    update(id, 'temperature', temp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BaseNode id={id} data={data} title="LLM Engine" iconType="llm"
      inputs={[{ id: `${id}-system`, label: 'system' }, { id: `${id}-prompt`, label: 'prompt' }]}
      outputs={[{ id: `${id}-response`, label: 'response' }]}
      minWidth={260}>
      <div>
        <label style={lbl}>Model</label>
        <CustomSelect value={model} onChange={v => { setModel(v); update(id, 'model', v); }} options={['Gemini 3.5 Flash', 'Claude Sonnet 5.5', 'Claude Haiku 4.5']} />
      </div>
      <div>
        <label style={lbl}>Temperature</label>
        <input type="range" min="0" max="1" step="0.1" value={temp}
          className="nodrag"
          onChange={e => { const t = parseFloat(e.target.value); setTemp(t); update(id, 'temperature', t); }}
          style={{ width: '100%', accentColor: '#584824' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#88867D', fontFamily: 'monospace', marginTop: 2 }}>
          <span>0.0</span><span style={{ color: '#584824', fontWeight: 600 }}>{temp.toFixed(1)}</span><span>1.0</span>
        </div>
      </div>
    </BaseNode>
  );
};
