# FlowForge - Demo Recording Script

*Note: Feel free to adjust this script to match your natural speaking style. Have your application running locally (both frontend and backend) before you start recording.*

---

## 1. Introduction & Overview (0:00 - 0:30)

**[Action: Start recording with your browser showing the main FlowForge canvas (Top Toolbar layout).]**

**Speaker:**
"Hi there, my name is [Your Name] and this is FlowForge, a visual workflow builder I built with React, ReactFlow, Zustand and FastAPI. 

The goal was a node-based editor with custom node types, a polished UI, and a backend that parses the graph and checks for cyclic dependencies. 

Instead of just fulfilling the basic requirements, I wanted to build a highly scalable, premium-feeling application with a robust design system."

---

## 2. Design Inspiration & The UI (0:30 - 1:30)

**[Action: Hover over the toolbar, drag a few nodes onto the canvas (e.g., LLM, Database, API Request). Show the hover animations and smooth dragging.]**

**Speaker:**
"For the aesthetic, I drew heavy inspiration from modern, premium data tools. I wanted the interface to feel warm but highly technical, which is why I used a beige palette (`#F5F2E8`), sharp borders, and monospace fonts for technical inputs.

One of the major UI improvements I made was replacing the ugly, default browser `<select>` dropdowns. 

**[Action: Click on the 'Method' dropdown in the API Request node or the 'Model' dropdown in the LLM node. Click outside to show it closes smoothly.]**

**Speaker:**
"I built a completely bespoke `<CustomSelect>` component. Dealing with custom dropdowns inside ReactFlow can be tricky due to event bubbling—ReactFlow often swallows click events to allow canvas panning. I handled this edge case by using the 'Capture Phase' in my event listeners, ensuring the dropdown closes instantly and natively when clicking outside of it, without interfering with canvas panning."

---

## 3. Node Architecture & Scalability (1:30 - 2:30)

**[Action: Drag out a few more diverse nodes like Filter, Validator, and Transform.]**

**Speaker:**
"In total, I built 8 custom nodes. To make this scalable, I didn't want to duplicate code for every single node. 

Instead, I built a `<BaseNode>` wrapper component. This handles all the standard node logic: the styling, the title headers, the input/output handle rendering, and the delete functionality. 

**[Action: Click the 'X' button on one of the nodes to delete it.]**

**Speaker:**
"Every node inherits from this base component. This means if I want to add a new node type in the future, it takes just a few lines of code. It drastically reduces boilerplate and ensures visual consistency across the entire pipeline builder."

---

## 4. Advanced Layout Features (2:30 - 3:00)

**[Action: Move your mouse to the top right header and click the 'Left Sidebar' toggle button. Watch the toolbar shift.]**

**Speaker:**
"I also wanted to give the user layout flexibility. I implemented a dynamic layout engine where the user can toggle the toolbar. 
On the technical side, I managed this layout shift using a single React state variable, `isSidebar`, stored in `App.js`. By toggling this state, the main container instantly switches its flexbox layout from a vertical column (`flex-col`) to a horizontal row (`flex-row`). The `PipelineToolbar` component receives this prop and dynamically applies different Tailwind CSS classes to reflow its internal items—switching from horizontal lists with vertical dividers to vertical stacks with horizontal dividers!

**[Action: Point out the 'Clear Canvas' button inside the canvas.]**
Additionally, I utilized the `Panel` component imported directly from the `reactflow` library. This allowed me to embed a 'Clear Canvas' button absolutely positioned inside the workflow layout, conditional on the global Zustand store's node count."

**[Action: Connect a few nodes. Hover your mouse over a connection string to show it turning bold, then press Backspace/Delete without clicking it to sever the connection.]**

**Speaker:**
"Another major UX improvement I made was to the connection edges themselves. I styled them to be sleek and thin by default, but when you hover over them, they smoothly transition to a bolder, darker line so you know exactly which string you are targeting. I also wired up a custom global keyboard listener—so you can simply hover over an edge and press Backspace to instantly delete it, bypassing the usual click-to-select behavior."

---

## 5. Backend Validation & Edge Cases (3:00 - 4:00)

**[Action: Connect a few nodes together in a valid, straight line (e.g., Input -> LLM -> Output). Click 'Submit Pipeline'. Show the success modal.]**

**Speaker:**
"Finally, the graph execution. When we hit 'Submit Pipeline', the frontend extracts all node and edge data from the Zustand global store and sends it to the FastAPI backend.

The backend parses the graph and runs a Depth-First Search (DFS) algorithm to detect cycles. 

**[Action: Close the modal. Create a cycle on the canvas (e.g., drag the output of the LLM back into the input of a previous node). Click 'Submit Pipeline' again to show the cycle detection warning.]**

**Speaker:**
"Handling edge cases like cyclical dependencies is crucial for data pipelines to prevent infinite loops. As you can see, if we create a cycle, the DFS algorithm catches it and the backend flags it. The frontend then displays this beautiful, blurred validation modal to give the user immediate feedback."

---

## 6. Conclusion & User Feedback (4:00 - 4:20)

**[Action: Click 'Clear Canvas' to wipe the board clean.]**

**Speaker:**
"Before concluding, I wanted to share that I actually showed this build to a couple of friends—one is a professional QA tester, and the other is a daily user of complex enterprise workflow tools like Jira. Both of them independently mentioned that this feels and looks like a fully professional, production-ready application rather than a side project! 

Overall, I focused on writing clean, modular React code with a centralized Zustand store, ensuring the app is highly performant and easy to scale. Thank you for your time, and I look forward to discussing this implementation further!"
