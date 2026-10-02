// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    removeNode: (nodeId) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== nodeId),
            edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        });
    },
    removeEdge: (edgeId) => {
        set({
            edges: get().edges.filter((edge) => edge.id !== edgeId),
        });
    },
    clearAll: () => {
        set({ nodes: [], edges: [] });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow}, style: { strokeWidth: 1.5, stroke: '#B8B5AA' }}, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
            : node
        ),
      });
    },

    // ── Pipeline execution state ──────────────────────────────
    // runState: { [nodeId]: { status: 'running' | 'done' | 'error', output?, message? } }
    runState: {},
    runStatus: 'idle', // 'idle' | 'running' | 'done' | 'error'
    runResults: null,
    runError: null,
    apiKeys: {},
    setApiKeys: (apiKeys) => set({ apiKeys }),
    startRun: () => set({ runState: {}, runStatus: 'running', runResults: null, runError: null }),
    setNodeRun: (nodeId, state) =>
      set({ runState: { ...get().runState, [nodeId]: state } }),
    finishRun: (status, extra = {}) => set({ runStatus: status, ...extra }),
  }));
