import React from 'react';

interface WireProps {
  id?: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  isTemporary?: boolean;
  isActive?: boolean;
  onDelete?: (id: string) => void; 
}

export const Wire: React.FC<WireProps> = ({ id, start, end, isTemporary, isActive, onDelete }) => {
  const dx = Math.abs(end.x - start.x) * 0.5;
  const path = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

  return (
    <g className="group">
      {!isTemporary && id && (
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth="15"
          className="wire-hit-area cursor-pointer pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Delete this connection?")) onDelete?.(id); 
          }}
        />
      )}

      <path
        d={path}
        fill="none"
        stroke={isTemporary ? '#475569' : isActive ? '#22d3ee' : '#06b6d4'}
        strokeWidth="2"
        strokeDasharray={isActive ? "10 5" : "0"} 
        className={`transition-all duration-300 pointer-events-none 
          ${isActive ? 'animate-[dash_1s_linear_infinite]' : ''} 
          ${!isTemporary ? 'group-hover:stroke-red-500 group-hover:stroke-[3px]' : ''}`}
        style={{
          filter: isTemporary ? 'none' : 'drop-shadow(0 0 8px rgba(6,182,212,0.4))'
        }}
      />
    </g>
  );
};