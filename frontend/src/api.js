// api.js — backend client. The API URL is configured at build time.

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * POST the graph to /pipelines/run and invoke onEvent for each server-sent event.
 * (EventSource only supports GET, so we parse the SSE stream from fetch directly.)
 */
export async function runPipeline({ nodes, edges, apiKeys, signal, onEvent }) {
  const res = await fetch(`${API_URL}/pipelines/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
      edges: edges.map(e => ({
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
      api_keys: apiKeys,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop();
    for (const frame of frames) {
      if (frame.startsWith('data: ')) onEvent(JSON.parse(frame.slice(6)));
    }
  }
}
