import React from 'react';
import {
  Server,
  Database,
  Loader2,
  Globe,
  Box,
  Send,
  ShieldCheck,
  MonitorSmartphone,
  Cloud,
  Zap,
} from 'lucide-react';
import './NodePalette.css';

const paletteGroups = [
  {
    title: '📦 Compute',
    items: [
      {
        type: 'server',
        label: 'Server',
        icon: Server,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        type: 'apiGateway',
        label: 'API Gateway',
        icon: Globe,
        gradient: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
      },
    ],
  },
  {
    title: '💾 Data',
    items: [
      {
        type: 'database',
        label: 'Database',
        icon: Database,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        type: 'cache',
        label: 'Cache',
        icon: Zap,
        gradient: 'linear-gradient(135deg, #fbd38d 0%, #f59e0b 100%)',
      },
      {
        type: 'storage',
        label: 'Object Storage',
        icon: Box,
        gradient: 'linear-gradient(135deg, #ffb347 0%, #ff9500 100%)',
      },
      {
        type: 'queue',
        label: 'Queue',
        icon: Send,
        gradient: 'linear-gradient(135deg, #c084fc 0%, #9b59b6 100%)',
      },
    ],
  },
  {
    title: '🌐 Networking',
    items: [
      {
        type: 'loadBalancer',
        label: 'Load Balancer',
        icon: Loader2,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        type: 'cdn',
        label: 'CDN',
        icon: Cloud,
        gradient: 'linear-gradient(135deg, #8b9fff 0%, #6d83ff 100%)',
      },
    ],
  },
  {
    title: '🔐 Services',
    items: [
      {
        type: 'authService',
        label: 'Auth Service',
        icon: ShieldCheck,
        gradient: 'linear-gradient(135deg, #34d399 0%, #1abc9c 100%)',
      },
    ],
  },
  {
    title: '👤 Entry',
    items: [
      {
        type: 'client',
        label: 'Client / Browser',
        icon: MonitorSmartphone,
        gradient: 'linear-gradient(135deg, #5fa8ff 0%, #3498db 100%)',
      },
    ],
  },
];

const NodePalette = () => {
  const handleDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-palette">
      <div className="palette-header">
        <h3>Components</h3>
        <p className="palette-subtitle">Drag to canvas</p>
      </div>
      <div className="palette-groups">
        {paletteGroups.map((group) => (
          <div key={group.title} className="palette-group">
            <div className="palette-group-title">{group.title}</div>
            <div className="palette-items">
              {group.items.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <div
                    key={nodeType.type}
                    className="palette-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                  >
                    <div
                      className="palette-item-icon"
                      style={{ background: nodeType.gradient }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="palette-item-label">{nodeType.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;

