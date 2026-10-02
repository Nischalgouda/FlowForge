# FlowForge - Technical Architecture

## 1. Overview
FlowForge is a visual node-based editor built with React, ReactFlow, Zustand, TailwindCSS, and FastAPI. Users drag nodes onto a canvas to build LLM pipelines, validate them as a DAG, and run them with Gemini or Claude, with progress streamed back per node. See the root README for diagrams and design decisions.

## 2. Frontend Architecture
- **Framework:** React 18 (Client-side rendered)
- **Graph Engine:** `reactflow` handles the canvas, panning, zooming, and edge routing. We use the `<ReactFlow>` component configured with a custom `nodeTypes` mapping.
- **State Management:** `zustand` is used for global state management (`store.js`). It maintains the `nodes` array, `edges` array, and handles graph mutations (`onNodesChange`, `onEdgesChange`, `onConnect`, `addNode`, `clearAll`). This allows any component (like the submit button or canvas panel) to access the graph state without prop-drilling.
- **Styling:** TailwindCSS is used for utility classes alongside custom inline styles for highly specific warm, minimal design tokens (e.g., `#F5F2E8` beige, `#D9D2C5` borders, `#584824` dark accents).
- **Component Hierarchy:**
  - `App.js`: Main layout wrapper. Manages the `isSidebar` state to dynamically toggle the layout between a horizontal top-bar and vertical left-sidebar.
  - `toolbar.js`: Renders the draggable node tiles. Uses the native HTML5 drag-and-drop API (`onDragStart` setting `application/reactflow` data).
  - `ui.js`: The ReactFlow canvas. Listens to `onDrop`, calculates viewport projection using `reactFlowInstance.project`, and injects nodes into Zustand. Also contains a `<Panel>` for the `Clear Canvas` button.
  - `common/BaseNode.jsx`: A high-order wrapper for ALL custom nodes. It abstracts away the card styling, the title header, the input/output ReactFlow `<Handle>` components, and the 'delete node' logic.
  - `common/CustomSelect.js`: A fully bespoke React dropdown component used across all nodes to replace native `<select>` elements. **Crucially**, its click-outside event listener uses the capture phase (`true`) to prevent ReactFlow from swallowing the event.

## 3. Node Types
We implemented 9 specific node types. All are registered in `ui.js` and extend `BaseNode.jsx`:
1. `InputNode`
2. `LLMNode`
3. `OutputNode`
4. `TextNode`
5. `APINode`
6. `DatabaseNode`
7. `FilterNode`
8. `ValidatorNode`
9. `TransformNode`

Input, Text, LLM and Output nodes mirror their settings into the Zustand store (`updateNodeField`), so the backend receives exactly what is on screen. The API, Database, Filter, Validator and Transform nodes are UI-only for now; the engine passes their input through.

## 4. Backend Architecture
- **Framework:** FastAPI (Python), Pydantic models for `Node`, `Edge`, `Pipeline`.
- **CORS:** Origins come from the `ALLOWED_ORIGINS` env var (`*` only as a local default).
- **Modules:**
  - `graph.py`: pure helpers. Kahn's algorithm returns an execution order or `None` when the graph has a cycle.
  - `engine.py`: runs nodes in topological order and yields events (`run_start`, `node_start`, `node_done`, `node_error`, `run_done`, `run_error`).
  - `providers.py`: Gemini and Claude adapters over plain REST (`httpx`).
  - `main.py`: routes, SSE streaming, bring-your-own-key handling, and an in-memory per-IP rate limit for runs that use the server's key.
- **Endpoints:** `GET /models`, `POST /pipelines/parse` (counts and `is_dag`), `POST /pipelines/run` (SSE stream).
- **Tests:** `pytest` covers graph ordering, cycle detection and the engine, with the LLM call mocked.

## 5. Known Edge Cases Addressed
- **ReactFlow Event Bubbling:** ReactFlow stops event propagation for drag/pan. This breaks standard click-outside hooks for custom UI elements (like our dropdowns). Solved by using the capture phase (`addEventListener(..., true)`).
- **DOM Layout Reflows:** Toggling from a top-bar to a side-bar requires the main wrapper to transition from `flex-col` to `flex-row`. Solved using a dynamic prop passed down to `PipelineToolbar` which switches its internal padding, borders, flex axes, and scroll properties based on the state.
- **Node Spawning:** Dropping a node requires projecting screen coordinates into the canvas coordinate space. Solved using `reactFlowInstance.project` accounting for the bounding client rect of the canvas wrapper.
- **Hover-to-Delete Edges:** ReactFlow defaults to click-to-select for edge deletion. To improve UX, a custom `hoveredEdge` state was introduced, tracking the active edge via `onEdgeMouseEnter` and `onEdgeMouseLeave`. A global `keydown` event listener monitors for `Backspace` or `Delete`, allowing instant severing of connections simply by hovering.
- **Custom Edge Styling:** CSS transitions were applied to `.react-flow__edge-path` for sleek hover effects (increasing stroke width and changing colors dynamically), significantly improving the visual feedback mechanism compared to native ReactFlow edges.
