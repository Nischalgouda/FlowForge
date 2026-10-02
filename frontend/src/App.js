// App.js — FlowForge

import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { RunButton, SettingsButton, ResultsPanel } from './run';

import { useState } from 'react';

function App() {
  const [isSidebar, setIsSidebar] = useState(false);

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ background: '#FCF9F0', color: '#0F131A', fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 sticky top-0 z-50 border-b"
        style={{ height: 56, background: '#F5F2E8', borderColor: '#D9D2C5' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <h1
            className="leading-none"
            style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}
          >
            <span style={{ color: '#0F131A' }}>Flow</span>
            <span style={{ color: '#584824' }}>Forge</span>
          </h1>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebar(!isSidebar)}
            style={{
              padding: '6px 12px', background: 'transparent', color: '#584824',
              border: '1px solid #D9D2C5', borderRadius: 6, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={e => e.target.style.background = '#F5F2E8'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            {isSidebar ? 'Top Toolbar' : 'Left Sidebar'}
          </button>
          <SettingsButton />
          <SubmitButton />
          <RunButton />
        </div>
      </header>

      {/* ── Main Layout ───────────────────────────────────────── */}
      <div className={`flex flex-1 overflow-hidden ${isSidebar ? 'flex-row' : 'flex-col'}`}>
        <PipelineToolbar isSidebar={isSidebar} />
        
        {/* ── Canvas ────────────────────────────────────────────── */}
        <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
          <PipelineUI />
          <ResultsPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
