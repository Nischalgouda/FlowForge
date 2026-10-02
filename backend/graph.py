"""Pure graph helpers: no I/O, easy to unit test."""
from collections import deque
from typing import Dict, Iterable, List, Optional, Tuple


def topological_order(
    node_ids: Iterable[str], edge_pairs: Iterable[Tuple[str, str]]
) -> Optional[List[str]]:
    """Kahn's algorithm. Returns a valid execution order, or None if the graph has a cycle."""
    ids = list(node_ids)
    indegree: Dict[str, int] = {n: 0 for n in ids}
    graph: Dict[str, List[str]] = {n: [] for n in ids}
    for src, tgt in edge_pairs:
        if src in graph and tgt in indegree:
            graph[src].append(tgt)
            indegree[tgt] += 1

    queue = deque(n for n in ids if indegree[n] == 0)
    order: List[str] = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    return order if len(order) == len(ids) else None


def has_cycle(node_ids: Iterable[str], edge_pairs: Iterable[Tuple[str, str]]) -> bool:
    return topological_order(node_ids, edge_pairs) is None
