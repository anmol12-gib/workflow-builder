import { create } from 'zustand';
import type { Node, Edge, Position, Viewport } from './types';

interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  gridEnabled: boolean;
  snapToGrid: boolean;
  selectedNodeId: string | null;
  history: { past: { nodes: Node[], edges: Edge[] }[]; future: { nodes: Node[], edges: Edge[] }[]; };
  simulationSpeed: number;
  
  // Halting & Reporting State
  isHalting: boolean;
  haltingTime: number;
  executionReport: {
    isOpen: boolean;
    nodesExecuted: number;
    dataTransferred: number;
    timeTaken: string;
    avgSpeed: string;
    haltingTime: string;
  } | null;

  // Actions
  setExecutionReport: (report: any) => void;
  setSimulationSpeed: (speed: number) => void;
  setNodes: (nodes: Node[]) => void;
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, position: Position) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  setViewport: (v: Partial<Viewport>) => void;
  setSelectedNode: (id: string | null) => void;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  createNewGraph: () => void;
  executeGraph: () => Promise<void>;
  exportJSON: () => void;
  importJSON: (data: string) => void;
  updateNodeData: (id: string, newData: Partial<Node['data']>) => void;
  onPacketSent: (edgeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  gridEnabled: true,
  snapToGrid: true,
  selectedNodeId: null,
  history: { past: [], future: [] },
  simulationSpeed: 1,
  executionReport: null,
  isHalting: false,
  haltingTime: 0,

  saveToHistory: () => set((state) => ({
    history: {
      past: [...state.history.past.slice(-19), { nodes: state.nodes, edges: state.edges }],
      future: []
    }
  })),

  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setExecutionReport: (report) => set({ executionReport: report }),
  setNodes: (nodes) => set({ nodes }),
  setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  toggleGrid: () => set((s) => ({ gridEnabled: !s.gridEnabled })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  zoomIn: () => set((s) => ({ viewport: { ...s.viewport, zoom: Math.min(s.viewport.zoom + 0.2, 2) } })),
  zoomOut: () => set((s) => ({ viewport: { ...s.viewport, zoom: Math.max(s.viewport.zoom - 0.2, 0.4) } })),

  addNode: (node) => {
    get().saveToHistory();
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  removeNode: (id) => {
    get().saveToHistory();
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.sourceNodeId !== id && e.targetNodeId !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
    }));
  },

  updateNodePosition: (id, pos) => set((state) => {
    const nodeWidth = 180;
    const nodeHeight = 120;
    const padding = 10;

    const newX = state.snapToGrid ? Math.round(pos.x / 20) * 20 : pos.x;
    const newY = state.snapToGrid ? Math.round(pos.y / 20) * 20 : pos.y;

    const isColliding = state.nodes.some(otherNode => {
      if (otherNode.id === id) return false;
      return (
        newX < otherNode.position.x + nodeWidth + padding &&
        newX + nodeWidth + padding > otherNode.position.x &&
        newY < otherNode.position.y + nodeHeight + padding &&
        newY + nodeHeight + padding > otherNode.position.y
      );
    });

    if (isColliding) return state;

    return {
      nodes: state.nodes.map(n => n.id === id ? { ...n, position: { x: newX, y: newY } } : n)
    };
  }),

  addEdge: (edge) => {
    const { edges, saveToHistory } = get();
    if (edge.sourceNodeId === edge.targetNodeId) return;

    const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
      const visited = new Set<string>();
      const queue = [targetId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === sourceId) return true;
        visited.add(current);
        edges.filter(e => e.sourceNodeId === current).forEach(e => {
          if (!visited.has(e.targetNodeId)) queue.push(e.targetNodeId);
        });
      }
      return false;
    };

    if (wouldCreateCycle(edge.sourceNodeId, edge.targetNodeId)) {
      window.alert("Invalid Connection: Cyclic dependency detected.");
      return;
    }

    saveToHistory();
    set((state) => ({ edges: [...state.edges, edge] }));
  },

  removeEdge: (id) => {
    get().saveToHistory();
    set(s => ({ edges: s.edges.filter(e => e.id !== id) }));
  },

  updateNodeData: (id, newData) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
    ),
  })),

  executeGraph: async () => {
    const { nodes, edges, updateNodeData, simulationSpeed, setExecutionReport } = get();
    const startTime = performance.now();
    let totalData = 0;
    let executedCount = 0;
    let totalHaltTime = 0;

    nodes.forEach(n => updateNodeData(n.id, { status: 'Awaiting' }));
    const triggers = nodes.filter(n => n.type === 'trigger' && !n.data.disabled);

    for (const startNode of triggers) {
      const queue = [startNode];
      const visited = new Set();

      while (queue.length > 0) {
        const currentId = queue.shift()!.id;
        let currentNode = get().nodes.find(n => n.id === currentId)!;

        // 1. Halting Logic: Wait for disabled nodes
        if (currentNode.data.disabled) {
          set({ isHalting: true });
          const haltStart = performance.now();
          while (get().nodes.find(n => n.id === currentId)?.data.disabled) {
            set({ haltingTime: (performance.now() - haltStart) / 1000 });
            await new Promise(r => setTimeout(r, 100));
          }
          totalHaltTime += (performance.now() - haltStart) / 1000;
          set({ isHalting: false, haltingTime: 0 });
          currentNode = get().nodes.find(n => n.id === currentId)!;
        }

        if (visited.has(currentNode.id)) continue;
        visited.add(currentNode.id);
        
        executedCount++;
        totalData += (currentNode.data.params?.dataSize || 124); 

        updateNodeData(currentNode.id, { status: 'Processing' });
        
        try {
          // 2. Error Logic: Stop if forceError is set
          if (currentNode.data.params?.forceError) throw new Error();
          await new Promise(r => setTimeout(r, 600 / simulationSpeed)); 
          updateNodeData(currentNode.id, { status: 'Complete' });
        } catch (err) {
          updateNodeData(currentNode.id, { status: 'Error' });
          window.alert(`Execution Failed at node: ${currentNode.data.label}. Program not completed.`);
          return;
        }

        const childEdges = edges.filter(e => e.sourceNodeId === currentNode.id);
        for (const edge of childEdges) {
          const nextNode = get().nodes.find(n => n.id === edge.targetNodeId);
          if (nextNode) {
            get().onPacketSent(edge.id); 
            await new Promise(r => setTimeout(r, 1000 / simulationSpeed)); 
            queue.push(nextNode);
          }
        }
      }
    }
    
    // 3. Reporting Logic: Final metrics calculation
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    const executionOnly = (duration - totalHaltTime) > 0 ? (duration - totalHaltTime) : 0.01;
    
    setExecutionReport({
      isOpen: true,
      nodesExecuted: executedCount,
      dataTransferred: totalData,
      timeTaken: duration.toFixed(2),
      haltingTime: totalHaltTime.toFixed(2),
      avgSpeed: (totalData / executionOnly).toFixed(2)
    });
  },

  exportJSON: () => {
    const { nodes, edges } = get();
    const data = JSON.stringify({ nodes, edges }, null, 2); 
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importJSON: (data) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.nodes || !parsed.edges) throw new Error();
      get().saveToHistory();
      set({ 
        nodes: parsed.nodes, 
        edges: parsed.edges, 
        selectedNodeId: null, 
        viewport: { x: 0, y: 0, zoom: 1 } 
      });
    } catch (err) {
      window.alert("Import failed: Invalid JSON structure.");
    }
  },

  onPacketSent: (edgeId) => {
    window.dispatchEvent(new CustomEvent('dispatch-packet', { detail: { edgeId } }));
  },

  undo: () => set((s) => {
    if (s.history.past.length === 0) return s;
    const prev = s.history.past[s.history.past.length - 1];
    return {
      nodes: prev.nodes,
      edges: prev.edges,
      history: { past: s.history.past.slice(0, -1), future: [{ nodes: s.nodes, edges: s.edges }, ...s.history.future] }
    };
  }),

  redo: () => set((s) => {
    if (s.history.future.length === 0) return s;
    const next = s.history.future[0];
    return {
      nodes: next.nodes,
      edges: next.edges,
      history: { past: [...s.history.past, { nodes: s.nodes, edges: s.edges }], future: s.history.future.slice(1) }
    };
  }),

  createNewGraph: () => {
    if (window.confirm("Start fresh?")) {
      set({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });
    }
  }
}));