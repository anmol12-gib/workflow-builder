import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Node, Edge, Position, Viewport, User } from './types';

interface ExecutionReport {
  isOpen: boolean;
  nodesExecuted: number;
  dataTransferred: number;
  timeTaken: string;
  avgSpeed: string;
  haltingTime: string;
  memorySize: string;
}

interface Project {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  lastUpdated: string;
  nodeCount: number;
}

interface WorkflowStore {
  currentUser: User | null;
  isHydrated: boolean;
  nodes: Node[];
  edges: Edge[];
  projects: Project[];
  viewport: Viewport;
  gridEnabled: boolean;
  snapToGrid: boolean;
  selectedNodeId: string | null;
  history: { past: { nodes: Node[], edges: Edge[] }[]; future: { nodes: Node[], edges: Edge[] }[]; };
  simulationSpeed: number;
  isSimulationRunning: boolean;
  isSimulationPaused: boolean;
  stepCount: number;
  isHalting: boolean;
  haltingTime: number;
  executionReport: ExecutionReport | null;
  currentProjectId: string | null;
  mousePosition: { x: number; y: number };

  // Actions
  setHydrated: (state: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setMousePosition: (pos: { x: number; y: number }) => void;
  setCurrentProjectId: (id: string | null) => void;
  setExecutionReport: (report: any) => void;
  updateUser: (updates: Partial<User>) => void;
  setSimulationSpeed: (speed: number) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  stepSimulation: () => void;
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
  zoomIn: () => void;
  zoomOut: () => void;
  createNewGraph: () => void;
  executeGraph: () => Promise<void>;
  saveProject: (name?: string) => void;
  deleteProject: (id: string) => void;
  exportJSON: () => void;
  importJSON: (data: string) => void;
  updateNodeData: (id: string, newData: Partial<Node['data']>) => void;
  onPacketSent: (edgeId: string, value?: boolean) => void;
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      projects: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      gridEnabled: true,
      snapToGrid: true,
      selectedNodeId: null,
      history: { past: [], future: [] },
      simulationSpeed: 1,
      isSimulationRunning: false,
      isSimulationPaused: false,
      stepCount: 0,
      executionReport: null,
      isHalting: false,
      haltingTime: 0,
      currentProjectId: null,
      currentUser: null,
      isHydrated: false,
      mousePosition: { x: 0, y: 0 },

      setHydrated: (state) => set({ isHydrated: state }),
      setCurrentUser: (user) => set({ currentUser: user }),
      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : state.currentUser
        })),
      setMousePosition: (mousePosition) => set({ mousePosition }),
      setCurrentProjectId: (id) => set({ currentProjectId: id }),
      setExecutionReport: (report) => set({ executionReport: report }),
      setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
      pauseSimulation: () => set((state) => (state.isSimulationRunning ? { isSimulationPaused: true } : state)),
      resumeSimulation: () => set((state) => (state.isSimulationRunning ? { isSimulationPaused: false, stepCount: 0 } : state)),
      stepSimulation: () => set((state) => {
        if (!state.isSimulationRunning) return state;
        return { isSimulationPaused: true, stepCount: state.stepCount + 1 };
      }),
      setNodes: (nodes) => set({ nodes }),

      // Dashboard Syncing
      saveProject: (name) => {
        const { nodes, edges, currentProjectId, projects } = get();
        const id = currentProjectId || `project-${Date.now()}`;
        const projectName = name || `Flow-${projects.length + 1}`;
        const newProject: Project = {
          id,
          name: projectName,
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          nodeCount: nodes.length,
          lastUpdated: new Date().toLocaleString(),
        };
        set((state) => ({
          projects: state.projects.find((p) => p.id === id)
            ? state.projects.map((p) => (p.id === id ? newProject : p))
            : [...state.projects, newProject],
          currentProjectId: id 
        }));
      },

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),

      // History & State Management
      saveToHistory: () => set((state) => ({
        history: {
          past: [...state.history.past.slice(-19), { 
            nodes: JSON.parse(JSON.stringify(state.nodes)), 
            edges: JSON.parse(JSON.stringify(state.edges)) 
          }],
          future: []
        }
      })),

      updateNodeData: (id, newData) => set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
        ),
      })),

      // Graph Mutators
      addNode: (node) => {
        get().saveToHistory();
        set((state) => ({ nodes: [...state.nodes, node] }));
      },

      removeNode: (id) => {
        get().saveToHistory();
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== id),
          edges: state.edges.filter((e) => {
            const sourceId = e.source ?? e.sourceNodeId;
            const targetId = e.target ?? e.targetNodeId;
            return sourceId !== id && targetId !== id;
          }),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
        }));
      },

      updateNodePosition: (id, pos) => set((state) => {
        const newX = state.snapToGrid ? Math.round(pos.x / 20) * 20 : pos.x;
        const newY = state.snapToGrid ? Math.round(pos.y / 20) * 20 : pos.y;
        return {
          nodes: state.nodes.map(n => n.id === id ? { ...n, position: { x: newX, y: newY } } : n)
        };
      }),

      addEdge: (edge) => {
        get().saveToHistory();
        set((state) => ({ edges: [...state.edges, edge] }));
      },

      removeEdge: (id) => {
        get().saveToHistory();
        set(s => ({ edges: s.edges.filter(e => e.id !== id) }));
      },

      // --- THE CORE EXECUTION ENGINE ---
      executeGraph: async () => {
        const { nodes, edges, updateNodeData, setExecutionReport } = get();
        if (get().isSimulationRunning) return;

        const startTime = performance.now();
        let totalData = 0;
        let executedCount = 0;
        let totalHaltTime = 0;
        let reachedFinishNode = false;

        set({ isSimulationRunning: true, isSimulationPaused: false, stepCount: 0, isHalting: false, haltingTime: 0 });

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const waitForExecutionPermit = async () => {
          while (true) {
            const state = get();
            if (!state.isSimulationRunning) return false;
            if (!state.isSimulationPaused) return true;
            if (state.stepCount > 0) {
              set((current) => ({ stepCount: Math.max(0, current.stepCount - 1) }));
              return true;
            }
            await sleep(80);
          }
        };

        const toBoolean = (value: unknown, fallback = false) => {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'number') return value !== 0;
          if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
            if (['false', '0', 'no', 'n', 'off', ''].includes(normalized)) return false;
          }
          return fallback;
        };

        const isFinishNode = (node: Node) =>
          node.data?.label?.toLowerCase().includes('finish') || node.outputs.length === 0;

        const evaluateLogicGate = (node: Node, inputs: boolean[]) => {
          const params = node.data?.params || {};
          const gateType = String(params.gateType || params.operator || 'AND').toUpperCase();
          const left = inputs[0] ?? toBoolean(params.a ?? params.left, false);
          const right = inputs[1] ?? toBoolean(params.b ?? params.right, false);
          const single = inputs[0] ?? toBoolean(params.input ?? params.a, false);

          if (gateType === 'OR') return left || right;
          if (gateType === 'NOT') return !single;
          if (gateType === 'XOR') return left !== right;
          if (gateType === 'NAND') return !(left && right);
          if (gateType === 'NOR') return !(left || right);

          if (gateType === 'EXPR' || gateType === 'EXPRESSION') {
            const expression = String(params.expression || params.expr || '').trim();
            if (!expression) return false;
            try {
              const fn = new Function('a', 'b', 'input', `return (${expression});`) as (a: boolean, b: boolean, input: boolean) => unknown;
              return toBoolean(fn(left, right, single), false);
            } catch {
              return false;
            }
          }

          // Default AND
          return left && right;
        };

        const nodeMap = new Map(nodes.map((node) => [node.id, node]));

        const getOutgoingTargets = (currentNode: Node) => {
          const outgoingTargets: { edgeId: string; targetNodeId: string; targetPortId?: string; sourcePortId?: string }[] = [];

          for (const edge of edges) {
            const sourceId = edge.source ?? edge.sourceNodeId;
            const targetId = edge.target ?? edge.targetNodeId;
            const sourcePortId = edge.sourcePortId;
            const targetPortId = edge.targetPortId;

            if (!sourceId || !targetId) continue;

            if (sourceId === currentNode.id) {
              outgoingTargets.push({
                edgeId: edge.id,
                targetNodeId: targetId,
                targetPortId: edge.targetPortId,
                sourcePortId: edge.sourcePortId
              });
              continue;
            }

            if (
              targetId === currentNode.id &&
              targetPortId &&
              currentNode.outputs.some((port) => port.id === targetPortId)
            ) {
              outgoingTargets.push({
                edgeId: edge.id,
                targetNodeId: sourceId,
                targetPortId: edge.sourcePortId,
                sourcePortId: edge.targetPortId
              });
              continue;
            }

            if (
              sourceId === currentNode.id &&
              sourcePortId &&
              currentNode.outputs.some((port) => port.id === sourcePortId)
            ) {
              outgoingTargets.push({
                edgeId: edge.id,
                targetNodeId: targetId,
                targetPortId: edge.targetPortId,
                sourcePortId: edge.sourcePortId
              });
            }
          }

          return outgoingTargets;
        };

        const getDirectedTargetsForValidation = (currentNode: Node) => {
          const targets = new Set<string>();

          for (const edge of edges) {
            const sourceId = edge.source ?? edge.sourceNodeId;
            const targetId = edge.target ?? edge.targetNodeId;
            if (!sourceId || !targetId) continue;
            if (sourceId !== currentNode.id) continue;

            // For DAG validation, only trust canonical forward edges:
            // source output port -> target input port.
            const sourceLooksValid =
              !edge.sourcePortId || currentNode.outputs.some((port) => port.id === edge.sourcePortId);
            const targetNode = nodeMap.get(targetId);
            const targetLooksValid =
              !edge.targetPortId || !!targetNode?.inputs.some((port) => port.id === edge.targetPortId);

            if (sourceLooksValid && targetLooksValid) {
              targets.add(targetId);
            }
          }

          return Array.from(targets);
        };

        try {
          const adjacency = new Map<string, string[]>();
          nodes.forEach((node) => adjacency.set(node.id, []));
          nodes.forEach((node) => {
            const targets = getDirectedTargetsForValidation(node);
            adjacency.set(node.id, targets);
          });

          const visitedForCycle = new Set<string>();
          const activePath = new Set<string>();

          const hasCycle = (nodeId: string): boolean => {
            if (activePath.has(nodeId)) return true;
            if (visitedForCycle.has(nodeId)) return false;

            visitedForCycle.add(nodeId);
            activePath.add(nodeId);

            for (const nextId of adjacency.get(nodeId) ?? []) {
              if (hasCycle(nextId)) return true;
            }

            activePath.delete(nodeId);
            return false;
          };

          if (nodes.some((node) => hasCycle(node.id))) {
            alert('Invalid workflow: graph must be a Directed Acyclic Graph (DAG). Remove cyclic connections and try again.');
            return;
          }

          setExecutionReport(null);
          nodes.forEach((n) => updateNodeData(n.id, { status: 'Awaiting' }));

          const triggers = nodes.filter(
            (n) => (n.type === 'trigger' || n.data?.label?.toLowerCase().includes('start')) && !n.data?.disabled
          );

          if (triggers.length === 0) return;

          const processNodeExecution = async (node: Node) => {
            executedCount++;
            totalData += node.data?.params?.dataSize || 124;
            updateNodeData(node.id, { status: 'Processing' });
            if (node.data?.params?.forceError) throw new Error();
            await sleep(600 / get().simulationSpeed);
            updateNodeData(node.id, { status: 'Complete' });
          };

          type WorkItem = {
            nodeId: string;
            value: boolean;
            edgeId?: string;
            targetPortId?: string;
            isStart?: boolean;
          };

          const queue: WorkItem[] = triggers.map((trigger) => ({
            nodeId: trigger.id,
            value: toBoolean(trigger.data?.params?.outputValue, true),
            isStart: true
          }));

          const processedNodes = new Set<string>();
          const logicInputBuffer = new Map<string, Map<string, boolean>>();

          while (queue.length > 0) {
            const canContinue = await waitForExecutionPermit();
            if (!canContinue) return;

            const currentItem = queue.shift()!;
            let currentNode = get().nodes.find((n) => n.id === currentItem.nodeId);
            if (!currentNode) continue;

            if (currentNode.data?.params?.breakpoint) {
              set({ isSimulationPaused: true });
              const canResumeFromBreakpoint = await waitForExecutionPermit();
              if (!canResumeFromBreakpoint) return;
            }

            if (currentNode.data?.disabled) {
              set({ isHalting: true });
              const haltStart = performance.now();
              while (get().nodes.find((n) => n.id === currentNode?.id)?.data?.disabled) {
                const stillRunning = get().isSimulationRunning;
                if (!stillRunning) return;
                set({ haltingTime: (performance.now() - haltStart) / 1000 });
                await sleep(100);
              }
              totalHaltTime += (performance.now() - haltStart) / 1000;
              set({ isHalting: false, haltingTime: 0 });
              currentNode = get().nodes.find((n) => n.id === currentItem.nodeId)!;
            }

            if (currentNode.type === 'logic') {
              const buffer = logicInputBuffer.get(currentNode.id) ?? new Map<string, boolean>();
              const fallbackPortId = currentNode.inputs[buffer.size]?.id ?? currentNode.inputs[0]?.id ?? `${currentNode.id}-in`;
              const targetPortId = currentItem.targetPortId ?? fallbackPortId;
              buffer.set(targetPortId, currentItem.value);
              logicInputBuffer.set(currentNode.id, buffer);

              const params = currentNode.data?.params || {};
              const gateType = String(params.gateType || params.operator || 'AND').toUpperCase();
              const requiredInputs = gateType === 'NOT' ? 1 : Math.max(2, currentNode.inputs.length || 2);
              if (buffer.size < requiredInputs) continue;
              if (processedNodes.has(currentNode.id)) continue;

              try {
                await processNodeExecution(currentNode);
              } catch {
                updateNodeData(currentNode.id, { status: 'Error' });
                return;
              }

              processedNodes.add(currentNode.id);
              const inputValues = currentNode.inputs.map((port) => buffer.get(port.id) ?? false);
              const gateResult = evaluateLogicGate(currentNode, inputValues);

              if (isFinishNode(currentNode)) {
                if (gateResult) reachedFinishNode = true;
                continue;
              }

              const nextTargets = getOutgoingTargets(currentNode);
              const outputValues = currentNode.outputs.map((_, idx) => {
                if (gateType === 'XOR' && currentNode.outputs.length >= 2) return idx === 0 ? gateResult : !gateResult;
                return gateResult;
              });

              for (const target of nextTargets) {
                const nextNode = nodeMap.get(target.targetNodeId) ?? get().nodes.find((n) => n.id === target.targetNodeId);
                if (!nextNode) continue;

                const sourceOutputIndex = target.sourcePortId
                  ? currentNode.outputs.findIndex((port) => port.id === target.sourcePortId)
                  : -1;
                const valueForEdge =
                  outputValues[sourceOutputIndex >= 0 ? sourceOutputIndex : 0] ?? gateResult;
                get().onPacketSent(target.edgeId, valueForEdge);
                await sleep(1000 / get().simulationSpeed);
                queue.push({
                  nodeId: nextNode.id,
                  value: valueForEdge,
                  edgeId: target.edgeId,
                  targetPortId: target.targetPortId
                });
              }
              continue;
            }

            if (processedNodes.has(currentNode.id)) continue;

            try {
              await processNodeExecution(currentNode);
            } catch {
              updateNodeData(currentNode.id, { status: 'Error' });
              return;
            }

            processedNodes.add(currentNode.id);

            if (isFinishNode(currentNode)) {
              reachedFinishNode = reachedFinishNode || currentItem.value;
              continue;
            }

            const nodeOutputValue = toBoolean(currentNode.data?.params?.outputValue, currentItem.value);
            const nextTargets = getOutgoingTargets(currentNode);
            for (const target of nextTargets) {
              const nextNode = nodeMap.get(target.targetNodeId) ?? get().nodes.find((n) => n.id === target.targetNodeId);
              if (!nextNode) continue;

              get().onPacketSent(target.edgeId, nodeOutputValue);
              await sleep(1000 / get().simulationSpeed);
              queue.push({
                nodeId: nextNode.id,
                value: nodeOutputValue,
                edgeId: target.edgeId,
                targetPortId: target.targetPortId
              });
            }
          }

          if (!reachedFinishNode) return;

          const endTime = performance.now();
          const duration = (endTime - startTime) / 1000;
          setExecutionReport({
            isOpen: true,
            nodesExecuted: executedCount,
            dataTransferred: totalData,
            timeTaken: duration.toFixed(2),
            haltingTime: totalHaltTime.toFixed(2),
            avgSpeed: (totalData / (duration - totalHaltTime || 0.1)).toFixed(2),
            memorySize: `${(JSON.stringify(get().nodes).length / 1024).toFixed(2)} KB`
          });
        } finally {
          set({ isSimulationRunning: false, isSimulationPaused: false, stepCount: 0, isHalting: false, haltingTime: 0 });
        }
      },

      // --- UI Utilities ---
      onPacketSent: (edgeId, value = true) => {
        window.dispatchEvent(new CustomEvent('dispatch-packet', { detail: { edgeId, value } }));
      },
      setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
      setSelectedNode: (id) => set({ selectedNodeId: id }),
      toggleGrid: () => set((s) => ({ gridEnabled: !s.gridEnabled })),
      toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
      zoomIn: () => set((s) => ({ viewport: { ...s.viewport, zoom: Math.min(s.viewport.zoom + 0.2, 2) } })),
      zoomOut: () => set((s) => ({ viewport: { ...s.viewport, zoom: Math.max(s.viewport.zoom - 0.2, 0.4) } })),

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
        if (window.confirm("Clear all nodes?")) {
          set({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 }, currentProjectId: null });
        }
      },

      exportJSON: () => {
        const { nodes, edges } = get();
        const data = JSON.stringify({ nodes, edges }, null, 2); 
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `flow-${Date.now()}.json`;
        a.click();
      },

      importJSON: (data) => {
        try {
          const parsed = JSON.parse(data);
          get().saveToHistory();
          set({ nodes: parsed.nodes, edges: parsed.edges, selectedNodeId: null });
        } catch { alert("Invalid JSON file."); }
      },
    }),
    {
      name: 'cyberflow-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        projects: state.projects,
        nodes: state.nodes,
        edges: state.edges,
        currentProjectId: state.currentProjectId
      }),
    }
  )
);