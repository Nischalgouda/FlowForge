// ui.js — Main ReactFlow canvas with all 9 node types registered

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant, Panel } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

// Core nodes
import { InputNode }    from './nodes/inputNode';
import { LLMNode }      from './nodes/llmNode';
import { OutputNode }   from './nodes/outputNode';
import { TextNode }     from './nodes/textNode';

// Custom nodes (Part 1b)
import { DatabaseNode }  from './nodes/DatabaseNode';
import { APINode }       from './nodes/APINode';
import { FilterNode }    from './nodes/FilterNode';
import { ValidatorNode } from './nodes/ValidatorNode';
import { TransformNode } from './nodes/TransformNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  customInput:  InputNode,
  llm:          LLMNode,
  customOutput: OutputNode,
  text:         TextNode,
  database:     DatabaseNode,
  api:          APINode,
  filter:       FilterNode,
  validator:    ValidatorNode,
  transform:    TransformNode,
};

const selector = (state) => ({
  nodes:          state.nodes,
  edges:          state.edges,
  getNodeID:      state.getNodeID,
  addNode:        state.addNode,
  onNodesChange:  state.onNodesChange,
  onEdgesChange:  state.onEdgesChange,
  onConnect:      state.onConnect,
  removeEdge:     state.removeEdge,
});

export const PipelineUI = () => {
  const reactFlowWrapper  = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const clearAll = useStore(state => state.clearAll);

  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    removeEdge,
  } = useStore(selector, shallow);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && hoveredEdge) {
        removeEdge(hoveredEdge);
        setHoveredEdge(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredEdge, removeEdge]);

  const getInitNodeData = (nodeID, type) => ({
    id: nodeID,
    nodeType: type,
  });

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        const type = appData?.nodeType;

        if (typeof type === 'undefined' || !type) return;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID  = getNodeID(type);
        const newNode = {
          id:       nodeID,
          type,
          position,
          data:     getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, addNode, getInitNodeData, getNodeID]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Theme values ────────────────────────────────────
  const bgColor     = '#FCF9F0';
  const gridColor   = '#D9D2C5';
  const miniMapBg   = '#FBF9F4';
  const miniMapNode = '#88867D';

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', background: bgColor }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeMouseEnter={(_, edge) => setHoveredEdge(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdge(null)}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: '#B8B5AA', strokeWidth: 1.5 }}
        defaultEdgeOptions={{ style: { strokeWidth: 1.5, stroke: '#B8B5AA' } }}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          color={gridColor}
          gap={24}
          size={2}
        />
        <Controls
          className="bg-white border border-[#D9D2C5] shadow-sm rounded overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          style={{ background: miniMapBg, border: '1px solid #D9D2C5' }}
          nodeColor={miniMapNode}
          maskColor="rgba(252, 249, 240, 0.7)"
        />
        {nodes.length > 0 && (
          <Panel position="top-right">
            <button
              onClick={clearAll}
              style={{
                padding: '6px 12px', background: '#FFFEFB', color: '#EF4444',
                border: '1px solid #EF4444', borderRadius: 6, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.15)'
              }}
              onMouseEnter={e => e.target.style.background = '#FEF2F2'}
              onMouseLeave={e => e.target.style.background = '#FFFEFB'}
            >
              Clear Canvas
            </button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
