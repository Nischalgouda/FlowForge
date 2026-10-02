"""Pipeline execution engine.

Runs nodes in topological order and yields progress events, which the API
streams to the browser as server-sent events.
"""
import re
from typing import Any, AsyncIterator, Callable, Dict, List, Optional

from graph import topological_order
import providers

VAR_RE = re.compile(r"\{\{\s*(\w+)\s*\}\}")
MAX_NODES = 50


class NodeError(Exception):
    pass


def _handle_name(node_id: str, handle: Optional[str]) -> str:
    """Handle ids look like '<node-id>-<name>'; return '<name>'."""
    if not handle:
        return "value"
    prefix = f"{node_id}-"
    return handle[len(prefix):] if handle.startswith(prefix) else handle


def _gather_inputs(node_id: str, edges: List[dict], outputs: Dict[str, Any]) -> Dict[str, Any]:
    inputs: Dict[str, Any] = {}
    for e in edges:
        if e["target"] == node_id and e["source"] in outputs:
            inputs[_handle_name(node_id, e.get("targetHandle"))] = outputs[e["source"]]
    return inputs


async def _run_node(node: dict, inputs: Dict[str, Any], resolve_key: Callable[[str], str]) -> Any:
    kind, data = node["type"], node.get("data") or {}

    if kind == "customInput":
        return str(data.get("value", ""))

    if kind == "text":
        template = str(data.get("text", ""))
        missing = [v for v in VAR_RE.findall(template) if v not in inputs]
        if missing:
            raise NodeError(f"Unconnected variable(s): {', '.join(sorted(set(missing)))}")
        return VAR_RE.sub(lambda m: str(inputs[m.group(1)]), template)

    if kind == "llm":
        prompt = inputs.get("prompt")
        if not prompt:
            raise NodeError("Connect something to the prompt input")
        label = data.get("model") or "Gemini 3.5 Flash"
        try:
            provider = providers.provider_for(label)
            return await providers.generate(
                label,
                str(prompt),
                str(inputs.get("system", "")),
                float(data.get("temperature", 0.7)),
                resolve_key(provider),
            )
        except providers.ProviderError as exc:
            raise NodeError(str(exc))

    if kind == "customOutput":
        return inputs.get("value", "")

    # api / database / filter / validator / transform are UI-only for now: pass through.
    return next(iter(inputs.values()), "")


async def run_pipeline(
    nodes: List[dict], edges: List[dict], resolve_key: Callable[[str], str]
) -> AsyncIterator[dict]:
    if len(nodes) > MAX_NODES:
        yield {"type": "run_error", "message": f"Pipeline too large (max {MAX_NODES} nodes)"}
        return

    by_id = {n["id"]: n for n in nodes}
    order = topological_order(by_id.keys(), [(e["source"], e["target"]) for e in edges])
    if order is None:
        yield {"type": "run_error", "message": "Pipeline contains a cycle and cannot run"}
        return

    yield {"type": "run_start", "order": order}
    outputs: Dict[str, Any] = {}
    results: Dict[str, Any] = {}

    for node_id in order:
        node = by_id[node_id]
        yield {"type": "node_start", "id": node_id}
        try:
            value = await _run_node(node, _gather_inputs(node_id, edges, outputs), resolve_key)
        except NodeError as exc:
            yield {"type": "node_error", "id": node_id, "message": str(exc)}
            yield {"type": "run_error", "message": f"{node_id}: {exc}"}
            return
        outputs[node_id] = value
        if node["type"] == "customOutput":
            key = (node.get("data") or {}).get("outputName") or node_id
            results[key] = value
        yield {"type": "node_done", "id": node_id, "output": value}

    yield {"type": "run_done", "results": results}
