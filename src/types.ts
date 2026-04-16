/**
 * Represents a point in 2D space for the canvas coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Defines a connection point (Port) on a node
 */
export interface Port {
  id: string;
  type: 'input' | 'output';
}

/**
 * Core data structure for a functional node in the workflow
 */
export interface Node {
  id: string;
  type: string;
  position: Position;
  data: {
    label: string;
    status?: string;
    disabled?:boolean;
    params?: Record<string, any>;
  };
  inputs: Port[];
  outputs: Port[];
  width: number;
  height: number;
}

/**
 * Represents a connection (wire) between two specific ports
 */
export interface Edge {
  id: string;
  // Custom workflow edge shape
  sourceNodeId?: string;
  sourcePortId?: string;
  targetNodeId?: string;
  targetPortId?: string;
  // React Flow-compatible edge shape
  source?: string;
  target?: string;
}

/**
 * Structure for the infinite canvas viewport
 */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Local UI state for tracking interactions like dragging or connecting
 */
export interface LocalUIState {
  isDraggingNode: boolean;
  isConnectingWire: boolean;
  hoveredPortId: string | null;
  dragStartPosition: Position | null;
}



export interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
  university?: string;
  bio?: string;
  avatar?: string;
  skills?: string;
}

export interface Tab {
  id: string;
  label: string;
  nodes: Node[];   // later you can replace with your NodeData type
  edges: Edge[];   // later replace with EdgeData type
}