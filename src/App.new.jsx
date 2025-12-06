import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePalette from './components/NodePalette';
import Header from './components/Header';
import SimulationPanel from './components/SimulationPanel';
import { nodeTypes } from './components/NodeTypes';
import { calculateMonthlyCost } from './utils/costCalculator';
import { generateTerraform, downloadTerraform } from './utils/terraformGenerator';
import { NODE_META, getEdgeMeta, validateConnection } from './utils/architectureUtils';
import './App.css';

const SNAP_GRID = [20, 20];
const INITIAL_NODES = [];
const INITIAL_EDGES = [];

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const monthlyCost = useMemo(() => calculateMonthlyCost(nodes), [nodes]);

  const nodesById = useMemo(() => {
    const map = {};
    nodes.forEach((n) => (map[n.id] = n));
    return map;
  }, [nodes]);

  const onConnect = useCallback(
    (params) => {
      const validation = validateConnection(params.source, params.target, nodesById);
      if (!validation.valid) {
        return;
      }

      const source = nodesById[params.source];
      const target = nodesById[params.target];
      const edgeMeta = getEdgeMeta(source?.type, target?.type);

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            ...edgeMeta,
          },
          eds
        )
      );
    },
    [nodesById, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const snappedX = Math.round(position.x / SNAP_GRID[0]) * SNAP_GRID[0];
      const snappedY = Math.round(position.y / SNAP_GRID[1]) * SNAP_GRID[1];
      const meta = NODE_META[type] || {};

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: snappedX, y: snappedY },
        data: {
          label: '',
          description: meta.description,
          properties: meta.properties,
          metrics: { cpu: 0, memory: 0, status: 'HEALTHY' },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !deleted.find((node) => node.id === edge.source || node.id === edge.target)
        )
      );
    },
    [setEdges]
  );

  const handleExportTerraform = useCallback(() => {
    if (nodes.length === 0) return;
    const terraformCode = generateTerraform(nodes, edges);
    downloadTerraform(terraformCode);
  }, [nodes, edges]);

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <Header
        monthlyCost={monthlyCost}
        onExportTerraform={handleExportTerraform}
        hasNodes={nodes.length > 0}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodesDelete={onNodesDelete}
            nodeTypes={nodeTypes}
            snapToGrid
            snapGrid={SNAP_GRID}
            fitView
            attributionPosition="bottom-left"
            connectionLineStyle={{ stroke: '#60a5fa', strokeWidth: 3 }}
            connectionLineType="smoothstep"
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#60a5fa',
              },
              style: {
                strokeWidth: 3,
                stroke: '#60a5fa',
              },
            }}
            isValidConnection={({ source, target }) =>
              validateConnection(source, target, nodesById).valid
            }
            minZoom={0.1}
            maxZoom={2}
          >
            <Background
              color="#334155"
              gap={SNAP_GRID[0]}
              size={1}
              style={{ opacity: 0.3 }}
              patternClassName="bg-dots"
            />
            <Controls
              showInteractive={false}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
              }}
            />
            <MiniMap
              nodeColor={(node) => {
                const colors = {
                  server: '#667eea',
                  database: '#f5576c',
                  cache: '#f59e0b',
                  loadBalancer: '#00f2fe',
                  apiGateway: '#2ecc71',
                  storage: '#ff9500',
                  queue: '#9b59b6',
                  authService: '#1abc9c',
                  client: '#3498db',
                  cdn: '#6d83ff',
                };
                return colors[node.type] || '#60a5fa';
              }}
              maskColor="rgba(10, 14, 39, 0.6)"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
              }}
            />
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-4xl mb-4">☁️</div>
                  <div className="text-xl text-slate-400 font-semibold">
                    Start building your cloud architecture
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    Drag components from the left sidebar onto the canvas
                  </div>
                </div>
              </div>
            )}
          </ReactFlow>
        </div>

        <div className="w-80 flex-shrink-0">
          <SimulationPanel
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            selectedScenario={selectedScenario}
            onScenarioSelect={setSelectedScenario}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
          />
        </div>
      </div>
    </div>
  );
};

export default App;

