import React from 'react';

interface DataPacketProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  speed: number; 
}

export const DataPacket: React.FC<DataPacketProps> = ({ start, end, speed }) => {
  // Define the Cubic Bezier path math
  const dx = Math.abs(end.x - start.x) * 0.5;
  const path = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

  // Calculate duration: 1 second divided by the speed multiplier
  const duration = `${1 / speed}s`;

  return (
    <circle r="3" fill="#22d3ee" className="animate-follow-path">
      <animateMotion 
        dur={duration} 
        repeatCount="1" 
        path={path} 
        fill="freeze"
      />
    </circle>
  );
};