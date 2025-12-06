// Architecture utilities - validation, metadata, edge configuration

export const NODE_META = {
  client: {
    description: "User's browser or mobile app - traffic origin",
    properties: {
      cost: '$0 (browser)',
      scaling: 'Depends on user demand',
      failure: 'No entry → no traffic reaches stack',
      performance: 'Latency depends on network and CDN',
    },
  },
  cdn: {
    description: 'Edge caching for static assets or cached API responses',
    properties: {
      cost: '$40-150/mo',
      scaling: 'Auto-scale at edge POPs',
      failure: 'Static assets uncached; origin load spikes',
      performance: 'Global latency 20-80ms',
    },
  },
  apiGateway: {
    description: 'Single entry point for API routing and rate limiting',
    properties: {
      cost: '$30-200/mo',
      scaling: 'Auto-scale per route',
      failure: 'Requests dropped or throttled',
      performance: 'Adds 5-20ms overhead',
    },
  },
  loadBalancer: {
    description: 'Distributes traffic across downstream servers',
    properties: {
      cost: '$20-100/mo',
      scaling: 'Auto-scale per target group',
      failure: 'Single target overload, 5xx spikes',
      performance: 'Adds 2-10ms hop',
    },
  },
  server: {
    description: 'Compute node handling business logic and APIs',
    properties: {
      cost: '$80-300/mo',
      scaling: 'Auto/Manual; vertical or horizontal',
      failure: 'Requests fail or slow; LB reroutes',
      performance: 'p95 60ms / 5k rps baseline',
    },
  },
  authService: {
    description: 'User authentication and authorization',
    properties: {
      cost: '$0-150/mo',
      scaling: 'Managed auto-scale',
      failure: 'Logins fail; APIs cannot issue tokens',
      performance: 'Adds 10-40ms per auth call',
    },
  },
  database: {
    description: 'Persistent storage for structured records',
    properties: {
      cost: '$120-600/mo',
      scaling: 'Vertical read replicas / sharding',
      failure: 'Writes fail; potential data loss',
      performance: 'p95 3-10ms (in-VPC)',
    },
  },
  cache: {
    description: 'In-memory cache for hot paths and sessions',
    properties: {
      cost: '$40-200/mo',
      scaling: 'Clustered nodes, auto failover',
      failure: 'Cache miss storm; DB load spikes',
      performance: '<1ms p95 in-VPC',
    },
  },
  storage: {
    description: 'Store files, images, backups, and static assets',
    properties: {
      cost: '$15-80/mo (usage-based)',
      scaling: 'Infinite, managed',
      failure: 'Assets unavailable; backups blocked',
      performance: '50-150ms typical, regional',
    },
  },
  queue: {
    description: 'Async message processing and decoupling',
    properties: {
      cost: '$5-50/mo (per million msgs)',
      scaling: 'Throughput scaling managed',
      failure: 'Messages pile up; latency increases',
      performance: 'Low-latency enqueue/dequeue',
    },
  },
};

import { MarkerType } from 'reactflow';

export const getEdgeMeta = (sourceType, targetType) => {
  // Storage read/write
  if (sourceType === 'storage' || targetType === 'storage') {
    return {
      label: 'Read / Write',
      animated: true,
      style: {
        stroke: '#ff9500',
        strokeWidth: 3,
        strokeDasharray: '8 6',
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9500' },
    };
  }

  // Queue messages
  if (sourceType === 'queue' || targetType === 'queue') {
    return {
      label: 'Message',
      animated: true,
      style: {
        stroke: '#9b59b6',
        strokeWidth: 3,
        strokeDasharray: '3 6',
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#9b59b6' },
    };
  }

  // Auth flow
  if (sourceType === 'authService' || targetType === 'authService') {
    return {
      label: 'Auth',
      animated: true,
      style: {
        stroke: '#1abc9c',
        strokeWidth: 3,
        strokeDasharray: '8 8',
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1abc9c' },
    };
  }

  return {
    animated: true,
    style: { stroke: '#60a5fa', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#60a5fa' },
  };
};

export const validateConnection = (sourceId, targetId, nodesById) => {
  const source = nodesById[sourceId];
  const target = nodesById[targetId];

  if (!source || !target) {
    return { valid: false, message: 'Unknown nodes' };
  }

  if (target.type === 'client') {
    return { valid: false, message: 'Client is an entry point; no incoming edges.' };
  }

  if (source.type === 'database' && target.type === 'client') {
    return { valid: false, message: 'Database cannot connect directly to Client.' };
  }

  if (target.type === 'queue' && !['server', 'apiGateway'].includes(source.type)) {
    return { valid: false, message: 'Queue accepts messages from Server/API only.' };
  }

  if (source.type === 'queue' && !['server', 'loadBalancer', 'apiGateway'].includes(target.type)) {
    return { valid: false, message: 'Queue should deliver to Server/Worker.' };
  }

  if (source.type === 'cdn' && !['storage', 'apiGateway'].includes(target.type)) {
    return { valid: false, message: 'CDN serves Storage or cached API responses only.' };
  }

  return { valid: true };
};

