import React, { useRef, useState, useEffect } from 'react';
import { useWorkflowStore } from '../store';
import { Node } from './Nodes'; 
import { Wire } from './Wire';
import { DataPacket } from './DataPacket';
import { Position } from '../types';

export const InteractionLayer: React.FC = () => {
  const { 
    nodes, edges, addEdge, removeEdge, viewport, 
    setViewport, updateNodePosition, gridEnabled, setSelectedNode,
    simulationSpeed 
  } = useWorkflowStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [tempWire, setTempWire] = useState<{ start: Position; end: Position; sourcePortId: string; sourceNodeId: string } | null>(null);
  const [activePackets, setActivePackets] = useState<{edgeId: string, id: string}[]>([]);

  const getPortPosition = (nodeId: string, portId: string): Position => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const isInput = node.inputs.some(p => p.id === portId);
    return {
      x: isInput ? node.position.x : node.position.x + 180,
      y: node.position.y + 60
    };
  };

  const getRelativeCoords = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
      y: (e.clientY - rect.top - viewport.y) / viewport.zoom
    };
  };

  useEffect(() => {
    const handler = (e: any) => {
      const edgeId = e.detail.edgeId;
      const packetId = `${edgeId}-${Date.now()}`;
      setActivePackets(prev => [...prev, { edgeId, id: packetId }]);
      const travelTime = 1000 / simulationSpeed;
      setTimeout(() => {
        setActivePackets(prev => prev.filter(p => p.id !== packetId));
      }, travelTime);
    };
    window.addEventListener('dispatch-packet', handler);
    return () => window.removeEventListener('dispatch-packet', handler);
  }, [simulationSpeed]);

  const onPortMouseDown = (portId: string, portType: 'input' | 'output', pos: Position) => {
    const node = nodes.find(n => n.inputs.some(p => p.id === portId) || n.outputs.some(p => p.id === portId));
    if (node) setTempWire({ start: pos, end: pos, sourcePortId: portId, sourceNodeId: node.id });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getRelativeCoords(e);
    if (tempWire) {
      setTempWire({ ...tempWire, end: coords });
    } else if (draggedNodeId) {
      updateNodePosition(draggedNodeId, { x: coords.x - 90, y: coords.y - 60 });
    } else if (isPanning) {
      setViewport({ x: viewport.x + e.movementX, y: viewport.y + e.movementY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (tempWire) {
      const target = e.target as HTMLElement;
      const targetPortId = target.getAttribute('data-port-id');
      const targetNodeId = target.closest('[data-node-id]')?.getAttribute('data-node-id');
      if (targetPortId && targetNodeId && targetNodeId !== tempWire.sourceNodeId) {
        addEdge({
          id: `e-${Date.now()}`,
          sourceNodeId: tempWire.sourceNodeId,
          sourcePortId: tempWire.sourcePortId,
          targetNodeId: targetNodeId,
          targetPortId: targetPortId
        });
      }
      setTempWire(null);
    }
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden bg-[#020617] cursor-crosshair" 
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        const nodeId = target.closest('[data-node-id]')?.getAttribute('data-node-id');
        if (target.closest('.wire-hit-area')) return;
        if (nodeId) {
          setDraggedNodeId(nodeId);
          setSelectedNode(nodeId);
        } else {
          setIsPanning(true);
        }
      }} 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp}
    >
      {gridEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle, #334155 1px, transparent 1px)`,
            backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
            opacity: 0.15
          }} 
        />
      )}
      
      <div style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, transformOrigin: '0 0' }}>
        <svg className="absolute inset-0 overflow-visible pointer-events-none" style={{ width: 1, height: 1, zIndex: 1 }}>
          {edges.map(edge => {
            const sNode = nodes.find(n => n.id === edge.sourceNodeId);
            if (!sNode) return null;
            const startPos = getPortPosition(edge.sourceNodeId, edge.sourcePortId);
            const endPos = getPortPosition(edge.targetNodeId, edge.targetPortId);
            const isWireActive = sNode.data.status === 'Processing' || activePackets.some(p => p.edgeId === edge.id);

            return (
              <g key={edge.id}>
                <Wire id={edge.id} start={startPos} end={endPos} isActive={isWireActive} onDelete={removeEdge} />
                {activePackets.filter(p => p.edgeId === edge.id).map(p => (
                  <DataPacket key={p.id} start={startPos} end={endPos} speed={simulationSpeed} />
                ))}
              </g>
            );
          })}
          {tempWire && <Wire start={tempWire.start} end={tempWire.end} isTemporary />}
        </svg>

        <div className="relative" style={{ zIndex: 2 }}>
          {nodes.map(node => (
            <div key={node.id} data-node-id={node.id} className="absolute" style={{ left: node.position.x, top: node.position.y }}>
              <Node node={node} viewport={viewport} onPortMouseDown={onPortMouseDown} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
