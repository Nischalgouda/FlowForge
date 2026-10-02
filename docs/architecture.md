# FlowForge - Technical Architecture

## 1. Overview
The FlowForge is a visual node-based editor built using React, ReactFlow, Zustand, TailwindCSS, and FastAPI. It allows users to drag-and-drop functional nodes to build complex logic graphs (like LLM chaining, data transformations, etc.).

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

Each node stores its unique configuration state locally (via `useState`), though in a full production app, this state would map directly back into the Zustand `data` object to persist changes on export.

## 4. Backend Architecture
- **Framework:** FastAPI (Python)
- **CORS:** Configured to allow all origins during development.
- **Data Models:** Uses `pydantic` to validate incoming JSON structures (`Node`, `Edge`, `Pipeline`).
- **Endpoint:** `POST /pipelines/parse`
- **Core Logic (Cycle Detection):**
  - Accepts the nodes and edges from the frontend.
  - Constructs an adjacency list representing a Directed Graph.
  - Runs a recursive Depth-First Search (DFS) algorithm with a recursion stack tracking mechanism (`rec_stack`) to detect cyclical dependencies (back-edges).
  - Returns `is_dag: bool`, `num_nodes: int`, and `num_edges: int`.

## 5. Known Edge Cases Addressed
- **ReactFlow Event Bubbling:** ReactFlow stops event propagation for drag/pan. This breaks standard click-outside hooks for custom UI elements (like our dropdowns). Solved by using the capture phase (`addEventListener(..., true)`).
- **DOM Layout Reflows:** Toggling from a top-bar to a side-bar requires the main wrapper to transition from `flex-col` to `flex-row`. Solved using a dynamic prop passed down to `PipelineToolbar` which switches its internal padding, borders, flex axes, and scroll properties based on the state.
- **Node Spawning:** Dropping a node requires projecting screen coordinates into the canvas coordinate space. Solved using `reactFlowInstance.project` accounting for the bounding client rect of the canvas wrapper.
- **Hover-to-Delete Edges:** ReactFlow defaults to click-to-select for edge deletion. To improve UX, a custom `hoveredEdge` state was introduced, tracking the active edge via `onEdgeMouseEnter` and `onEdgeMouseLeave`. A global `keydown` event listener monitors for `Backspace` or `Delete`, allowing instant severing of connections simply by hovering.
- **Custom Edge Styling:** CSS transitions were applied to `.react-flow__edge-path` for sleek hover effects (increasing stroke width and changing colors dynamically), significantly improving the visual feedback mechanism compared to native ReactFlow edges.
