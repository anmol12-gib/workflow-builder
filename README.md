# Cyberflow v1: Interactive Node-Based Workflow Builder

Cyberflow is a high-performance, interactive visual scripting tool designed for building and simulating complex data-driven workflows.  
Built as part of **Project 3: Advanced Frontend Engineering**, it features a custom execution engine, real-time metrics, and advanced graph logic.

---

## Live Demo

https://workflow-builder-one-wheat.vercel.app/

---

## Key Features

### Advanced Engineering Track

- **Custom Execution Engine**  
  BFS-based graph traversal system that simulates real-time data flow through the node network.

- **Cyclic Dependency Detection**  
  Prevents infinite loops by validating every new connection using a custom graph search algorithm before edge creation.

- **Smart Halting Logic**  
  Execution pauses if a data packet reaches a disabled node and starts a live timer.  
  Transfer resumes automatically once the node is re-enabled.

- **AABB Collision Detection**  
  Nodes automatically calculate bounding boxes to prevent overlapping and maintain a clean workspace.

---

### Real-Time Simulation and Reporting

- **Visual Data Packets**  
  Bezier-curve-based animations representing data movement between node ports.

- **Performance Metrics Report**  
  Automatically generated report after execution containing:
  - Total data transferred
  - Execution speed (KB/s)
  - Total execution time
  - Halting delays

- **Error Handling System**  
  Logic nodes turn red and halt execution if invalid parameters (`forceError`) are detected.

---

### Persistence and UI

- **State Serialization**  
  Full support for exporting and importing entire workflows as JSON files.

- **Undo / Redo History**  
  Robust history stack tracking node movements, deletions, and connections.

- **Cyber-Dark UI**  
  High-fidelity dark mode with backdrop blurs, neon accents, and responsive layout.

---

## Technical Stack

- **Framework:** React 18 with vite project 
- **State Management:** Zustand with deep persistence and history tracking  
- **Styling:** Tailwind CSS  
- **Icons:** Lucide React  
- **Build Tool:** Vite  

---

## Folder Structure

```plaintext
src/
├── components/
│   ├── DataPacket.tsx        # Packet animation logic
│   ├── ExecutionReport.tsx   # Results modal with throughput stats
│   ├── InteractionLayer.tsx  # SVG canvas and wire rendering
│   ├── Nodes.tsx             # Node UI with error and disabled states
│   ├── Properties.tsx        # Sidebar for parameter editing
│   ├── SideBar.tsx           # Draggable node palette
│   └── StatusBar.tsx         # System status indicators
├── store.ts                  # Zustand store: BFS engine and cycle detection
├── types.ts                  # TypeScript interfaces for nodes and edges
└── App.tsx                   # Main layout and halting timer

