// run.js — Run button, API-key settings, and results panel

import { useState, useRef } from 'react';
import { useStore } from './store';
import { runPipeline } from './api';
import { PlayIcon, CloseIcon } from './common/nodeIcons';

const btnBase = {
  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
  borderRadius: 6, cursor: 'pointer', padding: '6px 12px',
};

/* ── Run ───────────────────────────────────────────────────────── */
export const RunButton = () => {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const apiKeys = useStore(s => s.apiKeys);
  const status = useStore(s => s.runStatus);
  const { startRun, setNodeRun, finishRun } = useStore.getState();
  const abortRef = useRef(null);
  const running = status === 'running';

  const handleRun = async () => {
    if (running) {
      abortRef.current?.abort();
      return;
    }
    if (nodes.length === 0) {
      finishRun('error', { runError: 'Drag some nodes onto the canvas first.' });
      return;
    }
    startRun();
    abortRef.current = new AbortController();
    try {
      await runPipeline({
        nodes, edges, apiKeys,
        signal: abortRef.current.signal,
        onEvent: ev => {
          if (ev.type === 'node_start') setNodeRun(ev.id, { status: 'running' });
          else if (ev.type === 'node_done') setNodeRun(ev.id, { status: 'done', output: ev.output });
          else if (ev.type === 'node_error') setNodeRun(ev.id, { status: 'error', message: ev.message });
          else if (ev.type === 'run_done') finishRun('done', { runResults: ev.results });
          else if (ev.type === 'run_error') finishRun('error', { runError: ev.message });
        },
      });
    } catch (err) {
      finishRun(
        'error',
        { runError: err.name === 'AbortError' ? 'Run cancelled.' : `Could not reach the backend: ${err.message}` }
      );
    }
  };

  return (
    <button
      onClick={handleRun}
      className="flex items-center gap-2"
      style={{ ...btnBase, background: running ? '#88867D' : '#0F131A', color: 'white', border: 'none' }}
    >
      <PlayIcon size={12} color="white" />
      {running ? 'Stop' : 'Run'}
    </button>
  );
};

/* ── Settings (bring-your-own keys) ────────────────────────────── */
const readSession = () => {
  try { return JSON.parse(sessionStorage.getItem('ff-keys') || '{}'); } catch { return {}; }
};

export const SettingsButton = () => {
  const [open, setOpen] = useState(false);
  const apiKeys = useStore(s => s.apiKeys);
  const setApiKeys = useStore(s => s.setApiKeys);
  const [draft, setDraft] = useState(apiKeys);

  const openModal = () => {
    const stored = Object.keys(apiKeys).length ? apiKeys : readSession();
    setDraft(stored);
    setOpen(true);
  };
  const save = () => {
    const clean = Object.fromEntries(Object.entries(draft).filter(([, v]) => v && v.trim()));
    setApiKeys(clean);
    try { sessionStorage.setItem('ff-keys', JSON.stringify(clean)); } catch { /* ignore */ }
    setOpen(false);
  };

  const field = (provider, label) => (
    <div>
      <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type="password" autoComplete="off" placeholder="Optional — leave empty to use the demo key"
        value={draft[provider] || ''}
        onChange={e => setDraft({ ...draft, [provider]: e.target.value })}
        style={{ width: '100%', border: '1px solid #D9D2C5', borderRadius: 4, padding: '6px 8px', fontSize: 12, background: '#FFFEFB', boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <>
      <button
        onClick={openModal}
        style={{ ...btnBase, background: 'transparent', color: '#584824', border: '1px solid #D9D2C5' }}
      >
        API Keys{Object.keys(apiKeys).length ? ' ✓' : ''}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(252,249,240,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-xl border border-[#D9D2C5] shadow-xl overflow-hidden" style={{ background: '#FBF9F4' }}>
            <div className="bg-[#F5F2E8] px-5 py-4 border-b border-[#D9D2C5] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0F131A]">Bring your own API keys</h2>
              <button onClick={() => setOpen(false)} aria-label="Close"><CloseIcon size={14} color="#88867D" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs text-[#54585F] leading-relaxed">
                Without keys, runs use a rate-limited demo key. Your keys are sent only with your run requests, kept in this
                tab's session storage, and never stored on the server.
              </p>
              {field('gemini', 'Gemini API key')}
              {field('anthropic', 'Anthropic API key')}
            </div>
            <div className="bg-[#F5F2E8] border-t border-[#D9D2C5] px-6 py-4 flex justify-end">
              <button onClick={save} style={{ ...btnBase, background: '#584824', color: 'white', border: 'none' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Results ───────────────────────────────────────────────────── */
export const ResultsPanel = () => {
  const status = useStore(s => s.runStatus);
  const results = useStore(s => s.runResults);
  const error = useStore(s => s.runError);
  const [hidden, setHidden] = useState(false);
  const [seen, setSeen] = useState(status);

  // Re-show the panel whenever a new run finishes.
  if (seen !== status) { setSeen(status); setHidden(false); }
  if (hidden || (status !== 'done' && status !== 'error')) return null;

  return (
    <div
      style={{
        position: 'absolute', left: 16, bottom: 16, zIndex: 10, width: 380, maxHeight: '45%',
        overflow: 'auto', background: '#FBF9F4', border: '1px solid #D9D2C5', borderRadius: 8,
        boxShadow: '0 4px 16px rgba(15,19,26,0.12)', fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #D9D2C5', background: '#F5F2E8' }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {status === 'done' ? 'Run results' : 'Run failed'}
        </span>
        <button onClick={() => setHidden(true)} aria-label="Dismiss"><CloseIcon size={14} color="#88867D" /></button>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {status === 'error' && <p style={{ fontSize: 12, color: '#B91C1C' }}>{error}</p>}
        {status === 'done' && Object.keys(results || {}).length === 0 && (
          <p style={{ fontSize: 12, color: '#54585F' }}>Run finished. Add an Output node to capture a result.</p>
        )}
        {status === 'done' && Object.entries(results || {}).map(([key, value]) => (
          <div key={key}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#88867D', marginBottom: 4 }}>{key}</div>
            <div style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: '#0F131A' }}>{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
