import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
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
  X,
} from 'lucide-react';
import './NodeTypes.css';

const nodeStyles = {
  server: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: Server,
    label: 'Server',
    description: 'Compute node handling business logic and APIs.',
  },
  database: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: Database,
    label: 'Database',
    description: 'Persistent data storage for structured records.',
  },
  cache: {
    gradient: 'linear-gradient(135deg, #fbd38d 0%, #f59e0b 100%)',
    icon: Zap,
    label: 'Cache',
    description: 'In-memory cache for hot paths and sessions.',
  },
  loadBalancer: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: Loader2,
    label: 'Load Balancer',
    description: 'Distributes traffic across downstream servers.',
  },
  apiGateway: {
    gradient: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    icon: Globe,
    label: 'API Gateway',
    description: 'Single entry point for API routing and rate limits.',
  },
  storage: {
    gradient: 'linear-gradient(135deg, #ffb347 0%, #ff9500 100%)',
    icon: Box,
    label: 'Object Storage',
    description: 'Store files, images, backups, and static assets.',
  },
  queue: {
    gradient: 'linear-gradient(135deg, #c084fc 0%, #9b59b6 100%)',
    icon: Send,
    label: 'Queue',
    description: 'Async message processing and decoupling.',
  },
  authService: {
    gradient: 'linear-gradient(135deg, #34d399 0%, #1abc9c 100%)',
    icon: ShieldCheck,
    label: 'Auth Service',
    description: 'User authentication and authorization.',
  },
  client: {
    gradient: 'linear-gradient(135deg, #5fa8ff 0%, #3498db 100%)',
    icon: MonitorSmartphone,
    label: 'Client / Browser',
    description: 'Traffic origin: browser or mobile app.',
  },
  cdn: {
    gradient: 'linear-gradient(135deg, #8b9fff 0%, #6d83ff 100%)',
    icon: Cloud,
    label: 'CDN',
    description: 'Edge caching for static and API responses.',
  },
};

const BaseNode = ({ data, type, selected, id }) => {
  const config = nodeStyles[type];
  const Icon = config.icon;
  const status = data?.metrics?.status || data?.status || 'HEALTHY';
  const metrics = data?.metrics || {};
  const { deleteElements } = useReactFlow();

  const getStatusClass = () => {
    if (status === 'CRITICAL') return 'status-critical';
    if (status === 'WARNING') return 'status-warning';
    return 'status-healthy';
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className={`custom-node ${selected ? 'selected' : ''} ${getStatusClass()}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle"
        style={{ background: '#60a5fa' }}
      />
      <div
        className="node-content"
        style={{
          background: config.gradient,
        }}
      >
        {selected && (
          <button
            className="node-delete-button"
            onClick={handleDelete}
            title="Delete node (or press Delete/Backspace)"
            aria-label="Delete node"
          >
            <X size={14} />
          </button>
        )}
        <div className="node-icon-wrapper">
          <Icon size={24} className="node-icon" />
        </div>
        <div className="node-label">{config.label}</div>
        {/* Only show metrics if they have meaningful values (not 0 or during simulation) */}
        {((metrics.cpu !== undefined && metrics.cpu > 0) || 
          (metrics.memory !== undefined && metrics.memory > 0) || 
          (metrics.threads !== undefined && metrics.threads > 0)) && (
          <div className="node-metrics">
            {metrics.cpu !== undefined && metrics.cpu > 0 && (
              <div className="metric-item">CPU: {metrics.cpu}%</div>
            )}
            {metrics.memory !== undefined && metrics.memory > 0 && (
              <div className="metric-item">Mem: {metrics.memory}%</div>
            )}
            {metrics.threads !== undefined && metrics.threads > 0 && (
              <div className="metric-item">Threads: {metrics.threads}</div>
            )}
          </div>
        )}
        {data?.region && (
          <div className="node-region-badge">
            {data.region}
          </div>
        )}
        {(data?.offline || data?.regionOffline) && (
          <div className="node-status-badge status-critical">
            OFFLINE
          </div>
        )}
        {(data?.promoted || data?.failover) && (
          <div className="node-status-badge" style={{ background: 'rgba(59, 130, 246, 0.9)', color: 'white' }}>
            FAILOVER
          </div>
        )}
        {(data?.vulnerable || data?.breached) && (
          <div className="node-status-badge status-critical">
            {data.breached ? 'BREACHED' : 'VULNERABLE'}
          </div>
        )}
        {(data?.wafActive || data?.shieldActive) && (
          <div className="node-status-badge" style={{ background: 'rgba(34, 197, 94, 0.9)', color: 'white' }}>
            PROTECTED
          </div>
        )}
        {status !== 'HEALTHY' && !data?.offline && !data?.regionOffline && (
          <div className={`node-status-badge status-${status.toLowerCase()}`}>
            {status}
          </div>
        )}
        <div className="node-description">
          {data.description || config.description}
        </div>
        {data.label && (
          <div className="node-custom-label">{data.label}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle"
        style={{ background: '#60a5fa' }}
      />
    </div>
  );
};

export const ServerNode = (props) => <BaseNode {...props} type="server" />;
export const DatabaseNode = (props) => <BaseNode {...props} type="database" />;
export const CacheNode = (props) => <BaseNode {...props} type="cache" />;
export const LoadBalancerNode = (props) => <BaseNode {...props} type="loadBalancer" />;
export const ApiGatewayNode = (props) => <BaseNode {...props} type="apiGateway" />;
export const StorageNode = (props) => <BaseNode {...props} type="storage" />;
export const QueueNode = (props) => <BaseNode {...props} type="queue" />;
export const AuthServiceNode = (props) => <BaseNode {...props} type="authService" />;
export const ClientNode = (props) => <BaseNode {...props} type="client" />;
export const CdnNode = (props) => <BaseNode {...props} type="cdn" />;

export const nodeTypes = {
  server: ServerNode,
  database: DatabaseNode,
  cache: CacheNode,
  loadBalancer: LoadBalancerNode,
  apiGateway: ApiGatewayNode,
  storage: StorageNode,
  queue: QueueNode,
  authService: AuthServiceNode,
  client: ClientNode,
  cdn: CdnNode,
};