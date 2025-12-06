import React from 'react';
import { BaseEdge, getSmoothStepPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate midpoint for delete button
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const handleDelete = (e) => {
    e.stopPropagation();
    // Dispatch custom event for edge deletion
    const event = new CustomEvent('deleteEdge', { detail: { edgeId: id } });
    window.dispatchEvent(event);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <text x={labelX} y={labelY - 10} textAnchor="middle" className="react-flow__edge-text">
          {label}
        </text>
      )}
      {/* Delete button circle */}
      <circle
        cx={midX}
        cy={midY}
        r="12"
        fill="rgba(239, 68, 68, 0.9)"
        className="react-flow__edge-delete-button"
        onClick={handleDelete}
      />
      {/* Delete button X */}
      <text
        x={midX}
        y={midY + 5}
        textAnchor="middle"
        className="react-flow__edge-delete-button-text"
        onClick={handleDelete}
        style={{ 
          fill: 'white', 
          fontSize: '16px', 
          fontWeight: 'bold',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        ×
      </text>
    </>
  );
};

export default CustomEdge;