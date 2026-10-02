import pytest

import engine
from graph import has_cycle, topological_order


# ── graph ──────────────────────────────────────────────────────────────────────

def test_empty_graph_is_dag():
    assert topological_order([], []) == []


def test_linear_order():
    assert topological_order(["a", "b", "c"], [("a", "b"), ("b", "c")]) == ["a", "b", "c"]


def test_diamond_is_dag():
    order = topological_order(list("abcd"), [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")])
    assert order[0] == "a" and order[-1] == "d"


def test_self_loop_is_cycle():
    assert has_cycle(["a"], [("a", "a")])


def test_disconnected_cycle_is_detected():
    assert has_cycle(["a", "b", "x", "y"], [("a", "b"), ("x", "y"), ("y", "x")])


# ── engine ─────────────────────────────────────────────────────────────────────

def _node(id_, type_, **data):
    return {"id": id_, "type": type_, "data": data}


def _edge(src, tgt, handle):
    return {"source": src, "target": tgt, "targetHandle": f"{tgt}-{handle}"}


async def _collect(nodes, edges, key=lambda p: "k"):
    return [e async for e in engine.run_pipeline(nodes, edges, key)]


@pytest.mark.asyncio
async def test_input_text_output_flow():
    nodes = [
        _node("in-1", "customInput", value="world"),
        _node("text-1", "text", text="Hello {{name}}!"),
        _node("out-1", "customOutput", outputName="greeting"),
    ]
    edges = [_edge("in-1", "text-1", "name"), _edge("text-1", "out-1", "value")]
    events = await _collect(nodes, edges)
    assert events[-1] == {"type": "run_done", "results": {"greeting": "Hello world!"}}


@pytest.mark.asyncio
async def test_unconnected_variable_stops_run():
    nodes = [_node("text-1", "text", text="Hi {{who}}")]
    events = await _collect(nodes, [])
    assert any(e["type"] == "node_error" for e in events)
    assert events[-1]["type"] == "run_error"


@pytest.mark.asyncio
async def test_cycle_is_rejected():
    nodes = [_node("a", "text"), _node("b", "text")]
    edges = [_edge("a", "b", "value"), _edge("b", "a", "value")]
    events = await _collect(nodes, edges)
    assert events == [{"type": "run_error", "message": "Pipeline contains a cycle and cannot run"}]


@pytest.mark.asyncio
async def test_llm_node_uses_provider(monkeypatch):
    async def fake_generate(label, prompt, system, temperature, api_key):
        return f"echo:{prompt}"

    monkeypatch.setattr(engine.providers, "generate", fake_generate)
    nodes = [
        _node("in-1", "customInput", value="ping"),
        _node("llm-1", "llm", model="Gemini 3.5 Flash", temperature=0.2),
        _node("out-1", "customOutput", outputName="r"),
    ]
    edges = [_edge("in-1", "llm-1", "prompt"), _edge("llm-1", "out-1", "value")]
    events = await _collect(nodes, edges)
    assert events[-1]["results"] == {"r": "echo:ping"}
