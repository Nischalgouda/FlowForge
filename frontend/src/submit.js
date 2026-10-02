// submit.js — Submit + Validation Modal (all inline SVG, zero emoji)

import { useState } from 'react';
import { useStore } from './store';
import { API_URL } from './api';
import { BoltIcon, CheckIcon, WarningIcon, CloseIcon, PlayIcon } from './common/nodeIcons';

/* ── Validation Result Modal ───────────────────────────────────── */
const ValidationModal = ({ result, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(252,249,240,0.85)', backdropFilter: 'blur(4px)' }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div
      className="w-full max-w-[448px] overflow-hidden rounded-xl border border-[#D9D2C5] shadow-xl"
      style={{ background: '#FBF9F4', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="bg-[#F5F2E8] px-5 py-4 border-b border-[#D9D2C5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BoltIcon size={16} color="#584824" />
          <h2 className="text-sm font-semibold text-[#0F131A]" style={{ letterSpacing: '-0.01em' }}>
            Pipeline Validation Report
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-[#88867D] hover:text-[#0F131A] transition-colors p-1 rounded"
          aria-label="Close"
        >
          <CloseIcon size={14} color="currentColor" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Status banner */}
        <div className={`flex items-start gap-3 p-3.5 rounded-md border ${
          result.is_dag
            ? 'bg-[#ECFDF5] border-[#6EE7B7]'
            : 'bg-[#FEF3C7] border-[#FCD34D]'
        }`}>
          {result.is_dag
            ? <CheckIcon size={18} color="#059669" />
            : <WarningIcon size={18} color="#D97706" />
          }
          <div>
            <p className={`text-xs font-semibold ${result.is_dag ? 'text-[#065F46]' : 'text-[#92400E]'}`}>
              {result.is_dag ? 'Valid Directed Acyclic Graph (DAG)' : 'Invalid DAG — Cycle Detected'}
            </p>
            <p className={`text-[11px] mt-0.5 leading-relaxed ${result.is_dag ? 'text-[#065F46]/80' : 'text-[#92400E]/80'}`}>
              {result.is_dag
                ? 'Your pipeline flows linearly without infinite loops.'
                : 'The pipeline contains cyclic dependencies. Remove the loop to proceed.'}
            </p>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'NODES COUNT', value: result.num_nodes },
            { label: 'EDGES COUNT', value: result.num_edges },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#F5F2E8] border border-[#D9D2C5] rounded-md p-4 flex flex-col items-center justify-center"
            >
              <span
                className="text-[9px] font-semibold uppercase text-[#88867D] mb-1.5"
                style={{ letterSpacing: '0.08em' }}
              >
                {label}
              </span>
              <span className="text-2xl font-bold text-[#403210]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#F5F2E8] border-t border-[#D9D2C5] px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="bg-[#584824] text-white text-xs font-medium px-5 py-2 rounded
                     hover:bg-[#403210] transition-colors"
        >
          Close Report
        </button>
      </div>
    </div>
  </div>
);

/* ── Error Modal ───────────────────────────────────────────────── */
const ErrorModal = ({ error, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(252,249,240,0.85)', backdropFilter: 'blur(4px)' }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div
      className="w-full max-w-sm overflow-hidden rounded-xl border border-[#D9D2C5] shadow-xl"
      style={{ background: '#FBF9F4', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="bg-[#F5F2E8] px-5 py-4 border-b border-[#D9D2C5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <WarningIcon size={16} color="#D97706" />
          <h2 className="text-sm font-semibold text-[#0F131A]">{error.title}</h2>
        </div>
        <button onClick={onClose} className="text-[#88867D] hover:text-[#0F131A] transition-colors p-1 rounded">
          <CloseIcon size={14} color="currentColor" />
        </button>
      </div>
      <div className="px-6 py-5">
        <p className="text-xs text-[#54585F] leading-relaxed whitespace-pre-line">{error.message}</p>
      </div>
      <div className="bg-[#F5F2E8] border-t border-[#D9D2C5] px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="bg-[#0F131A] text-white text-xs font-medium px-4 py-2 rounded hover:bg-[#20242C] transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
);

/* ── Spinner ───────────────────────────────────────────────────── */
const Spinner = () => (
  <span style={{
    display: 'inline-block', width: 12, height: 12,
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'ff-spin 0.7s linear infinite',
  }} />
);

/* ── Submit Button ─────────────────────────────────────────────── */
export const SubmitButton = () => {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const [loading, setLoading]         = useState(false);
  const [modalResult, setModalResult] = useState(null);
  const [modalError,  setModalError]  = useState(null);

  const handleSubmit = async () => {
    if (nodes.length === 0) {
      setModalError({ title: 'Empty Canvas', message: 'Drag some nodes onto the canvas before submitting.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ id: n.id })),
          edges: edges.map(e => ({ source: e.source, target: e.target })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      setModalResult(await res.json());
    } catch (err) {
      setModalError({
        title: 'Backend Connection Error',
        message: `${err.message}\n\nMake sure the FastAPI server is running:\n  cd backend && uvicorn main:app --reload`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        id="submit-pipeline"
        onClick={handleSubmit}
        disabled={loading}
        className={`flex items-center gap-2 bg-[#584824] text-white px-4 py-2 rounded
                    text-xs font-medium transition-colors
                    ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#403210]'}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {loading ? <Spinner /> : <PlayIcon size={12} color="white" />}
        {loading ? 'Validating…' : 'Validate'}
      </button>

      <style>{`@keyframes ff-spin { to { transform: rotate(360deg); } }`}</style>

      {modalResult && <ValidationModal result={modalResult} onClose={() => setModalResult(null)} />}
      {modalError  && <ErrorModal  error={modalError}       onClose={() => setModalError(null)}  />}
    </>
  );
};
