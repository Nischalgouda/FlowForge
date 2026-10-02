import json
import os
import time
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import providers
from engine import NodeError, run_pipeline
from graph import has_cycle

load_dotenv()

app = FastAPI(title="FlowForge API")

# Comma-separated list of allowed origins; "*" is only a local-dev default.
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ─────────────────────────────────────────────────────────────────────

class Node(BaseModel):
    id: str
    type: str = ""
    data: Dict[str, Any] = Field(default_factory=dict)


class Edge(BaseModel):
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class RunRequest(Pipeline):
    # Bring-your-own keys; used for this request only and never logged or stored.
    api_keys: Dict[str, str] = Field(default_factory=dict)


# ── Rate limiting (server-key runs only) ───────────────────────────────────────

RUNS_PER_HOUR = int(os.getenv("RUNS_PER_HOUR", "10"))
_runs: Dict[str, deque] = defaultdict(deque)


def _allow(ip: str) -> bool:
    now, window = time.time(), _runs[ip]
    while window and now - window[0] > 3600:
        window.popleft()
    if len(window) >= RUNS_PER_HOUR:
        return False
    window.append(now)
    return True


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "FlowForge API"}


@app.get("/models")
def models():
    return {"models": list(providers.MODELS.keys())}


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):
    """Validate the graph: node/edge counts and whether it is a DAG."""
    node_ids = [n.id for n in pipeline.nodes]
    edge_pairs = [(e.source, e.target) for e in pipeline.edges]
    return {
        "num_nodes": len(node_ids),
        "num_edges": len(edge_pairs),
        "is_dag": not has_cycle(node_ids, edge_pairs),
    }


@app.post("/pipelines/run")
async def run(req: RunRequest, request: Request):
    """Execute the pipeline in topological order, streaming progress as SSE."""
    ip = request.client.host if request.client else "unknown"
    rate_limited = False

    def resolve_key(provider: str) -> str:
        nonlocal rate_limited
        if req.api_keys.get(provider):
            return req.api_keys[provider]
        key = providers.server_key(provider)
        if not key:
            raise NodeError(f"No {provider} API key configured. Add your own key in Settings.")
        if not _allow(ip):
            rate_limited = True
            raise NodeError(
                f"Demo limit reached ({RUNS_PER_HOUR} LLM calls/hour). Add your own key to continue."
            )
        return key

    async def stream():
        async for event in run_pipeline(
            [n.model_dump() for n in req.nodes],
            [e.model_dump() for e in req.edges],
            resolve_key,
        ):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
