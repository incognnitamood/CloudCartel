// Comprehensive Simulation Engine - 6 Disaster Scenarios

export const SCENARIOS = {
  BLACK_FRIDAY: {
    id: 'black_friday',
    name: '🔥 Black Friday',
    description: '10x traffic spike',
    difficulty: 'Medium',
    duration: '~45 seconds',
    icon: '🔥',
  },
  DB_CRASH: {
    id: 'db_crash',
    name: '💥 DB Crash',
    description: 'Primary DB down',
    difficulty: 'Hard',
    duration: '~30 seconds',
    icon: '💥',
  },
  SLOW_API: {
    id: 'slow_api',
    name: '🐌 Slow API',
    description: 'External delays',
    difficulty: 'Medium',
    duration: '~40 seconds',
    icon: '🐌',
  },
  SECURITY_BREACH: {
    id: 'security_breach',
    name: '🔓 Security Breach',
    description: 'SQL injection',
    difficulty: 'Hard',
    duration: '~20 seconds',
    icon: '🔓',
  },
  COST_OVERRUN: {
    id: 'cost_overrun',
    name: '💰 Cost Overrun',
    description: 'Bill exceeds budget',
    difficulty: 'Easy',
    duration: '~30 seconds',
    icon: '💰',
  },
  REGIONAL_OUTAGE: {
    id: 'regional_outage',
    name: '🌍 Regional Outage',
    description: 'AWS region fails',
    difficulty: 'Expert',
    duration: '~60 seconds',
    icon: '🌍',
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get node status based on metrics
const getNodeStatus = (cpu, memory) => {
  if (cpu === 0 && memory === 0) return 'CRITICAL';
  if (cpu >= 95 || memory >= 95) return 'CRITICAL';
  if (cpu >= 85 || memory >= 85) return 'WARNING';
  if (cpu >= 70 || memory >= 70) return 'WARNING';
  return 'HEALTHY';
};

// Update node with metrics and additional properties
const updateNodeMetrics = (node, cpu, memory, status, extraData = {}) => {
  return {
    ...node,
    data: {
      ...node.data,
      metrics: { 
        cpu, 
        memory, 
        status,
        ...extraData,
      },
      status,
      ...extraData,
    },
  };
};

// Calculate resilience score
export function calculateScore(scenarioId, nodes, edges, results) {
  let score = 0;
  let maxScore = 100;
  const feedback = [];

  const hasLoadBalancer = nodes.some(n => n.type === 'loadBalancer');
  const hasCDN = nodes.some(n => n.type === 'cdn');
  const hasCache = nodes.some(n => n.type === 'cache');
  const servers = nodes.filter(n => n.type === 'server');
  const databases = nodes.filter(n => n.type === 'database');
  const hasAuth = nodes.some(n => n.type === 'authService');
  const hasQueue = nodes.some(n => n.type === 'queue');
  const hasApiGateway = nodes.some(n => n.type === 'apiGateway');

  switch (scenarioId) {
    case 'black_friday':
      if (hasCDN) { score += 15; feedback.push('+15: CDN handling static assets'); }
      if (hasLoadBalancer) { score += 15; feedback.push('+15: Load balancer distributing traffic'); }
      if (servers.length >= 4) { score += 20; feedback.push('+20: Sufficient server capacity'); }
      else if (servers.length >= 2) { score += 10; feedback.push('+10: Multiple servers help'); }
      if (hasCache) { score += 15; feedback.push('+15: Cache protecting database'); }
      if (servers.length < 2) { feedback.push('-20: Single server is a bottleneck'); }
      if (!hasLoadBalancer && servers.length > 0) { feedback.push('-15: No load balancing'); }
      break;

    case 'db_crash':
      if (databases.length > 1) { score += 30; feedback.push('+30: Database replica available'); }
      if (hasCache) { score += 25; feedback.push('+25: Cache serving read requests'); }
      if (hasQueue) { score += 15; feedback.push('+15: Queue buffering writes'); }
      if (databases.length === 0) { feedback.push('No database to fail'); }
      else if (databases.length === 1 && !hasCache) { feedback.push('-30: No redundancy or cache'); }
      break;

    case 'slow_api':
      score += 20; feedback.push('+20: External API detected');
      if (hasQueue) { score += 25; feedback.push('+25: Queue for async retry'); }
      if (hasLoadBalancer) { score += 15; feedback.push('+15: Load balancer health checks'); }
      if (hasApiGateway) { score += 15; feedback.push('+15: API Gateway timeout handling'); }
      if (!hasQueue) { feedback.push('-25: No queue for retry logic'); }
      break;

    case 'security_breach':
      if (hasApiGateway) { score += 20; feedback.push('+20: API Gateway with WAF'); }
      if (hasAuth) { score += 25; feedback.push('+25: Authentication service protecting access'); }
      if (!nodes.some(n => n.type === 'client' && edges.some(e => e.target === n.id))) {
        score += 15; feedback.push('+15: No direct client-to-database access');
      }
      if (edges.some(e => {
        const source = nodes.find(n => n.id === e.source);
        const target = nodes.find(n => n.id === e.target);
        return source?.type === 'client' && target?.type === 'database';
      })) {
        score -= 30; feedback.push('-30: Direct client-to-database connection!');
      }
      if (!hasAuth) { feedback.push('-20: No authentication layer'); }
      break;

    case 'cost_overrun':
      if (hasCDN) { score += 20; feedback.push('+20: CDN reducing data transfer costs'); }
      if (hasCache) { score += 15; feedback.push('+15: Cache reducing database costs'); }
      if (servers.length <= 4) { score += 10; feedback.push('+10: Reasonable server count'); }
      if (!hasCDN) { feedback.push('-20: Missing CDN causes high transfer costs'); }
      if (servers.length > 8) { feedback.push('-15: Too many servers increase costs'); }
      break;

    case 'regional_outage':
      const regions = new Set(nodes.map(n => n.data?.region || 'us-east-1'));
      if (regions.size > 1) { score += 40; feedback.push('+40: Multi-region architecture'); }
      if (hasCDN) { score += 20; feedback.push('+20: CDN with global distribution'); }
      if (databases.length > 1 && regions.size > 1) { 
        score += 20; 
        feedback.push('+20: Database replication across regions');
      }
      if (regions.size === 1) { feedback.push('-40: Single region = total outage risk'); }
      break;
  }

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  const badge = score >= 90 ? '🏆' : score >= 70 ? '🥈' : score >= 50 ? '🥉' : '⚠️';

  return { score, maxScore, grade, badge, feedback };
}

