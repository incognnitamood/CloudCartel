// Simulation Engine - Handles all disaster scenarios

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
  if (cpu >= 85 || memory >= 85) return 'WARNING';
  if (cpu >= 95 || memory >= 95) return 'CRITICAL';
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

// 🔥 Black Friday Scenario (Enhanced Traffic Spike)
export async function runBlackFridayScenario(nodes, edges, setNodes, addLog) {
  addLog('🔥 BLACK FRIDAY STARTED! Traffic spiking...');
  await sleep(1000);
  
  addLog('📈 Traffic increasing: 100 → 1,000 → 5,000 → 10,000 req/s');
  await sleep(1500);

  const loadBalancers = nodes.filter((n) => n.type === 'loadBalancer');
  const servers = nodes.filter((n) => n.type === 'server');
  const cdns = nodes.filter((n) => n.type === 'cdn');
  const caches = nodes.filter((n) => n.type === 'cache');
  const databases = nodes.filter((n) => n.type === 'database');
  
  const hasLoadBalancer = loadBalancers.length > 0;
  const hasCDN = cdns.length > 0;
  const hasCache = caches.length > 0;
  const serverCount = servers.length;

  addLog(`🔍 Architecture check: ${serverCount} server(s), ${loadBalancers.length} load balancer(s), ${cdns.length} CDN(s), ${caches.length} cache(s)`);
  await sleep(1500);

  let costIncrease = 0;
  let baseCost = 250;

  // Check CDN
  if (!hasCDN) {
    addLog('❌ Static assets overwhelming servers');
    costIncrease += 1200;
  } else {
    addLog('✅ CDN serving static assets at edge');
    cdns.forEach((cdn) => {
      const updated = updateNodeMetrics(cdn, 70, 65, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === cdn.id ? updated : n)));
    });
  }
  await sleep(1000);

  // Check Load Balancer
  if (!hasLoadBalancer) {
    addLog('❌ CRITICAL: No Load Balancer detected!');
    await sleep(500);
    servers.forEach((server) => {
      const updated = updateNodeMetrics(server, 100, 95, 'CRITICAL');
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
    });
    addLog('💥 Server crashed - CPU: 100%, Memory: 95%');
    addLog('🚨 All servers in CRITICAL state - service unavailable');
    return { success: false, message: 'CRITICAL: Architecture collapsed under load' };
  }
  await sleep(800);

  // Check server count
  if (serverCount === 1) {
    addLog('⚠️  WARNING: Only 1 server detected');
    await sleep(500);
    if (servers.length > 0) {
      const server = servers[0];
      const updated = updateNodeMetrics(server, 92, 88, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
      addLog(`⚠️  Server overloaded - CPU: 92%, Memory: 88%, Response time: 15s`);
    }
    addLog('💡 Suggestion: Auto-scaling would add servers automatically');
  } else if (serverCount >= 2 && serverCount <= 3) {
    addLog('⚠️  Servers at 90% CPU, struggling');
    servers.forEach((server, index) => {
      const updated = updateNodeMetrics(server, 90, 85, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
      addLog(`📊 Server ${index + 1}: CPU 90%, Memory 85%`);
    });
    await sleep(1000);
    addLog('💡 Suggestion: Auto-scaling would add servers automatically');
  } else if (serverCount >= 4) {
    addLog('✅ Load distributed well (CPU 60%)');
    servers.forEach((server, index) => {
      const cpu = 55 + Math.floor(Math.random() * 10);
      const memory = 50 + Math.floor(Math.random() * 10);
      const updated = updateNodeMetrics(server, cpu, memory, 'HEALTHY');
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
      addLog(`📊 Server ${index + 1}: CPU ${cpu}%, Memory ${memory}%`);
    });
    await sleep(1000);
  }

  // Check Cache
  if (!hasCache && databases.length > 0) {
    addLog('❌ Database drowning in queries (5000 qps)');
    await sleep(800);
    databases.forEach((db) => {
      const updated = updateNodeMetrics(db, 95, 90, 'CRITICAL');
      setNodes((nds) => nds.map((n) => (n.id === db.id ? updated : n)));
    });
    costIncrease += 400;
  } else if (hasCache) {
    addLog('✅ Cache hit rate 85%, DB protected');
    await sleep(800);
    caches.forEach((cache) => {
      const updated = updateNodeMetrics(cache, 80, 75, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === cache.id ? updated : n)));
    });
    if (databases.length > 0) {
      databases.forEach((db) => {
        const updated = updateNodeMetrics(db, 60, 55, 'HEALTHY');
        setNodes((nds) => nds.map((n) => (n.id === db.id ? updated : n)));
      });
    }
  }

  // Cost calculation
  const totalCost = baseCost + costIncrease;
  if (costIncrease > 0) {
    addLog(`💰 Cost spike: $${baseCost}/mo → $${totalCost}/mo during spike (${Math.round((costIncrease/baseCost)*100)}% increase)`);
    await sleep(1000);
  }

  addLog('🏁 Traffic normalizing... spike lasted 2 hours');
  await sleep(1000);

  if (serverCount >= 4 && hasCache) {
    addLog('✅ RECOVERED: Architecture handled Black Friday successfully!');
    return { success: true, message: 'RECOVERED: Black Friday traffic spike handled' };
  } else if (serverCount >= 2) {
    addLog('⚠️  WARNING: Architecture survived but struggled');
    return { success: true, message: 'WARNING: Black Friday traffic partially handled' };
  } else {
    return { success: false, message: 'CRITICAL: Black Friday traffic overwhelmed architecture' };
  }
}

// 💥 Database Crash Scenario (Enhanced)
export async function runDBCrashScenario(nodes, edges, setNodes, addLog) {
  addLog('💥 CRITICAL: Primary database crashed! (Hardware failure)');
  await sleep(1000);
  
  const databases = nodes.filter((n) => n.type === 'database');
  const caches = nodes.filter((n) => n.type === 'cache');
  const queues = nodes.filter((n) => n.type === 'queue');
  const hasCache = caches.length > 0;
  const hasQueue = queues.length > 0;

  if (databases.length === 0) {
    addLog('⚠️  No database found in architecture');
    return { success: false, message: 'No database to crash' };
  }

  const primaryDb = databases[0];
  addLog(`💀 Primary database ${primaryDb.id} is crashing...`);
  await sleep(1500);

  const crashedDb = updateNodeMetrics(primaryDb, 0, 0, 'CRITICAL', { offline: true });
  setNodes((nds) => nds.map((n) => (n.id === primaryDb.id ? crashedDb : n)));
  addLog('❌ CRITICAL: Database CPU: 0%, Memory: 0% - OFFLINE');
  await sleep(1000);

  let usersAffected = 100;
  let recoveryTime = 180; // minutes

  // Check Cache
  if (!hasCache) {
    addLog('❌ 100% of requests failing immediately');
    await sleep(800);
  } else {
    addLog('🔍 Checking for cache layer...');
    await sleep(800);
    addLog('✅ Cache detected! Serving 80% of read traffic');
    addLog('💡 Cache can handle reads, but writes will fail');
    await sleep(500);
    usersAffected = 20; // 80% can still read
    caches.forEach((cache) => {
      const updated = updateNodeMetrics(cache, 85, 80, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === cache.id ? updated : n)));
    });
    addLog('⚠️  Cache under heavy load - CPU: 85%');
  }

  // Check for Replica
  if (databases.length > 1) {
    addLog('🔍 Checking for database replica...');
    await sleep(800);
    addLog('✅ Replica database found! Initiating failover...');
    await sleep(1500);
    const replica = databases[1];
    const activated = updateNodeMetrics(replica, 60, 55, 'HEALTHY', { promoted: true, failover: true });
    setNodes((nds) => nds.map((n) => (n.id === replica.id ? activated : n)));
    recoveryTime = 0.5; // 30 seconds
    addLog('✅ Replica promoted to primary');
    await sleep(800);
  } else {
    addLog('❌ No replica database available for failover');
    await sleep(800);
  }

  // Check Queue
  if (hasQueue) {
    addLog('✅ Write requests buffered in queue for retry');
    await sleep(800);
    queues.forEach((queue) => {
      const updated = updateNodeMetrics(queue, 0, 0, 'WARNING', { messagesBuffered: true, bufferCount: 150 });
      setNodes((nds) => nds.map((n) => (n.id === queue.id ? updated : n)));
    });
    addLog('📨 Queue buffering 150 write operations');
  } else {
    addLog('❌ All write operations lost permanently');
    await sleep(800);
  }

  // Show user impact
  addLog(`👥 Users affected: ${usersAffected}%`);
  await sleep(800);
  addLog(`⏱️  Recovery time: ${recoveryTime === 0.5 ? '30 seconds' : recoveryTime + ' minutes'}`);
  await sleep(1000);

  if (databases.length > 1) {
    addLog('✅ RECOVERED: Failover successful, replica promoted');
    addLog('🎉 Architecture recovered from database crash!');
    return { success: true, message: 'RECOVERED: Database failover successful' };
  } else if (hasCache) {
    addLog('⚠️  WARNING: Reads working via cache, writes blocked');
    return { success: true, message: 'WARNING: Cache serving reads, writes blocked' };
  } else {
    addLog('❌ CRITICAL: No cache or replica available');
    addLog('💥 All database-dependent services are DOWN');
    return { success: false, message: 'CRITICAL: Complete database failure' };
  }
}

// Cache Storm Scenario
export async function runCacheStormScenario(nodes, edges, setNodes, addLog) {
  addLog('🔥 Starting Cache Storm Scenario...');
  addLog('⚡ Cache cluster failing...');
  await sleep(1000);

  const caches = nodes.filter((n) => n.type === 'cache');
  const databases = nodes.filter((n) => n.type === 'database');

  if (caches.length === 0) {
    addLog('⚠️  No cache found in architecture');
    return { success: false, message: 'No cache to fail' };
  }

  caches.forEach((cache) => {
    const crashed = updateNodeMetrics(cache, 0, 0, 'CRITICAL');
    setNodes((nds) => nds.map((n) => (n.id === cache.id ? crashed : n)));
  });
  addLog('❌ CRITICAL: Cache cluster offline - CPU: 0%, Memory: 0%');
  await sleep(1000);

  addLog('📊 Analyzing impact on database...');
  await sleep(1000);

  if (databases.length > 0) {
    addLog('💥 Cache miss storm detected!');
    addLog('📈 All requests now hitting database directly...');
    await sleep(1000);

    databases.forEach((db) => {
      const overloaded = updateNodeMetrics(db, 95, 92, 'CRITICAL');
      setNodes((nds) => nds.map((n) => (n.id === db.id ? overloaded : n)));
    });
    addLog('❌ CRITICAL: Database overload - CPU: 95%, Memory: 92%');
    addLog('🚨 Database performance severely degraded');
    await sleep(500);
    addLog('💡 Recommendation: Scale database or add cache replicas');
    return { success: false, message: 'CRITICAL: Database overload from cache failure' };
  }

  addLog('⚠️  No database found - impact unclear');
  return { success: false, message: 'WARNING: Cache failed but no database to impact' };
}

// DDoS Attack Scenario
export async function runDDoSScenario(nodes, edges, setNodes, addLog) {
  addLog('⚔️  Starting DDoS Attack Scenario...');
  addLog('🌊 Simulating 50,000 malicious req/s flood...');
  await sleep(1000);

  const cdns = nodes.filter((n) => n.type === 'cdn');
  const loadBalancers = nodes.filter((n) => n.type === 'loadBalancer');
  const servers = nodes.filter((n) => n.type === 'server');
  const hasCDN = cdns.length > 0;
  const hasLoadBalancer = loadBalancers.length > 0;

  addLog(`🔍 Protection check: CDN (${cdns.length}), Load Balancer (${loadBalancers.length})`);
  await sleep(1000);

  let blockedAtEdge = 0;
  let reachedServers = 50000;

  if (hasCDN) {
    blockedAtEdge = Math.floor(50000 * 0.9);
    reachedServers = 5000;
    addLog(`🛡️  CDN blocking 90% of traffic at edge (${blockedAtEdge} req/s blocked)`);
    await sleep(1000);
    cdns.forEach((cdn) => {
      const updated = updateNodeMetrics(cdn, 75, 70, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === cdn.id ? updated : n)));
    });
    addLog(`📊 CDN handling edge protection - CPU: 75%`);
  }

  if (hasLoadBalancer) {
    const beforeLB = reachedServers;
    const blockedByLB = Math.floor(beforeLB * 0.3);
    reachedServers = beforeLB - blockedByLB;
    addLog(`⚖️  Load Balancer blocking additional ${blockedByLB} req/s`);
    await sleep(1000);
    loadBalancers.forEach((lb) => {
      const updated = updateNodeMetrics(lb, 80, 75, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === lb.id ? updated : n)));
    });
    addLog(`📊 Load Balancer under stress - CPU: 80%`);
  }

  await sleep(1000);
  addLog(`🎯 ${reachedServers} req/s reaching servers...`);

  if (reachedServers > 1000 && servers.length > 0) {
    servers.forEach((server) => {
      const cpu = 85 + Math.floor(Math.random() * 14);
      const memory = 80 + Math.floor(Math.random() * 15);
      const status = cpu >= 95 ? 'CRITICAL' : 'WARNING';
      const updated = updateNodeMetrics(server, cpu, memory, status);
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
    });
    addLog(`❌ ${servers.length} server(s) in ${reachedServers > 5000 ? 'CRITICAL' : 'WARNING'} state`);
  }

  if (!hasCDN && !hasLoadBalancer) {
    addLog('❌ CRITICAL: No protection layer - all traffic hitting servers');
    await sleep(500);
    servers.forEach((server) => {
      const updated = updateNodeMetrics(server, 99, 97, 'CRITICAL');
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
    });
    addLog('💥 Complete infrastructure collapse');
    return { success: false, message: 'CRITICAL: DDoS attack succeeded - no protection' };
  }

  if (reachedServers < 1000) {
    addLog('✅ RECOVERED: Attack mitigated by protection layers');
    addLog('🎉 Architecture successfully defended against DDoS!');
    return { success: true, message: 'RECOVERED: DDoS attack mitigated' };
  }

  addLog('⚠️  WARNING: Some traffic leaked through');
  addLog('💡 Recommendation: Add WAF or rate limiting');
  return { success: true, message: 'WARNING: DDoS partially mitigated' };
}

// 💰 Cost Overrun Scenario
export async function runCostOverrunScenario(nodes, edges, setNodes, addLog) {
  addLog('💰 COST ALERT: Monthly spend exceeding budget');
  await sleep(1000);
  
  const cdns = nodes.filter((n) => n.type === 'cdn');
  const databases = nodes.filter((n) => n.type === 'database');
  const servers = nodes.filter((n) => n.type === 'server');
  const caches = nodes.filter((n) => n.type === 'cache');
  const storages = nodes.filter((n) => n.type === 'storage');
  const loadBalancers = nodes.filter((n) => n.type === 'loadBalancer');

  const baseCost = 250;
  let dataTransferCost = 0;
  let databaseCost = 0;
  let serverCost = 0;
  let cacheCost = 0;
  let storageCost = 0;
  let lbCost = 0;

  // Analyze architecture for cost issues
  addLog('📊 Analyzing cost breakdown...');
  await sleep(1500);

  // Data transfer costs (without CDN)
  if (cdns.length === 0) {
    dataTransferCost = 1200;
    addLog('❌ $1,200 in data transfer costs (CDN would be $35)');
  } else {
    dataTransferCost = 35;
    addLog('✅ CDN reducing data transfer: $35');
  }
  await sleep(800);

  // Database costs
  if (databases.length > 0) {
    databaseCost = databases.length * 300;
    addLog(`⚠️  Database: ${databases.length}x instances = $${databaseCost}/mo`);
    addLog('   (500GB allocated but only using 20GB - over-provisioned)');
  }
  await sleep(800);

  // Server costs
  if (servers.length > 0) {
    serverCost = servers.length * 150;
    addLog(`⚠️  Servers: ${servers.length}x t3.2xlarge = $${serverCost}/mo`);
    if (servers.length > 4) {
      addLog('   (Using oversized instances when t3.medium sufficient)');
    }
    if (servers.length > 8) {
      addLog('   ❌ Running 10 servers 24/7 when need 2 servers 90% of time');
    }
  }
  await sleep(800);

  // Cache costs
  if (caches.length === 0 && databases.length > 0) {
    cacheCost = 0;
    addLog('❌ Database IOPS charges: $400 (cache would eliminate this)');
    databaseCost += 400;
  } else if (caches.length > 0) {
    cacheCost = caches.length * 60;
    addLog(`✅ Cache: ${caches.length}x = $${cacheCost}/mo (saving DB costs)`);
  }
  await sleep(800);

  // Storage costs
  if (storages.length > 0) {
    storageCost = storages.length * 60;
    addLog(`⚠️  Storage: Using SSD for archival data (HDD is 10x cheaper)`);
    const potentialSavings = storageCost * 0.9;
    addLog(`   💡 Could save $${Math.round(potentialSavings)}/mo with HDD tier`);
  }
  await sleep(800);

  // Load Balancer costs
  if (loadBalancers.length > 1) {
    lbCost = loadBalancers.length * 50;
    addLog(`⚠️  Multiple Load Balancers: ${loadBalancers.length}x = $${lbCost}/mo`);
    addLog('   (One LB could handle all traffic)');
  } else if (loadBalancers.length === 1) {
    lbCost = 50;
  }
  await sleep(800);

  const totalCost = baseCost + dataTransferCost + databaseCost + serverCost + cacheCost + storageCost + lbCost;
  const increase = totalCost - baseCost;
  const increasePercent = Math.round((increase / baseCost) * 100);

  addLog(`💰 Current bill: $${baseCost} → $${totalCost} (${increasePercent}% increase!)`);
  await sleep(1000);

  addLog('📊 Cost breakdown:');
  addLog(`   Data transfer: $${dataTransferCost}`);
  addLog(`   Database: $${databaseCost}`);
  addLog(`   Servers: $${serverCost}`);
  addLog(`   Cache: $${cacheCost}`);
  addLog(`   Storage: $${storageCost}`);
  addLog(`   Load Balancers: $${lbCost}`);
  await sleep(1500);

  addLog('💡 Cost optimization suggestions:');
  const suggestions = [];
  let potentialSavings = 0;

  if (cdns.length === 0) {
    suggestions.push(`1. Add CDN: Save $${1200 - 35}/mo`);
    potentialSavings += 1165;
  }
  if (databases.length > 0) {
    suggestions.push(`2. Right-size database: Save $120/mo`);
    potentialSavings += 120;
  }
  if (caches.length === 0 && databases.length > 0) {
    suggestions.push(`3. Add cache: Save $400/mo`);
    potentialSavings += 400;
  }
  if (servers.length > 8) {
    suggestions.push(`4. Use auto-scaling: Save $640/mo`);
    potentialSavings += 640;
  }
  if (storages.length > 0) {
    suggestions.push(`5. Move to cheaper storage tier: Save $180/mo`);
    potentialSavings += 180;
  }
  if (loadBalancers.length > 1) {
    suggestions.push(`6. Consolidate Load Balancers: Save $${(loadBalancers.length - 1) * 50}/mo`);
    potentialSavings += (loadBalancers.length - 1) * 50;
  }

  for (const suggestion of suggestions) {
    addLog(suggestion);
    await sleep(500);
  }

  await sleep(1000);
  const optimizedCost = totalCost - potentialSavings;
  addLog(`✅ Optimized architecture cost: $${optimizedCost}/mo (${Math.round((potentialSavings/totalCost)*100)}% savings!)`);

  if (potentialSavings > totalCost * 0.5) {
    return { success: true, message: `WARNING: Significant cost optimization possible ($${potentialSavings}/mo savings)` };
  } else if (totalCost > baseCost * 2) {
    return { success: false, message: `CRITICAL: Cost overrun detected (${increasePercent}% over budget)` };
  } else {
    return { success: true, message: 'Cost analysis complete' };
  }
}

// 🐌 Slow API Scenario
export async function runSlowAPIScenario(nodes, edges, setNodes, addLog) {
  addLog('🐌 External payment API responding in 8 seconds (normal: 200ms)');
  await sleep(1500);
  
  addLog('⏳ Your API waiting... waiting... waiting...');
  await sleep(1000);

  const servers = nodes.filter((n) => n.type === 'server');
  const queues = nodes.filter((n) => n.type === 'queue');
  const loadBalancers = nodes.filter((n) => n.type === 'loadBalancer');
  const apiGateways = nodes.filter((n) => n.type === 'apiGateway');
  
  const hasQueue = queues.length > 0;
  const hasLoadBalancer = loadBalancers.length > 0;
  const hasApiGateway = apiGateways.length > 0;

  let threadCount = 100;
  let timeoutConfigured = false;
  let circuitBreaker = false;
  let retryLogic = false;
  let fallback = false;

  // Check timeout configuration (simulated - assume API Gateway has timeout)
  if (hasApiGateway) {
    timeoutConfigured = true;
    addLog('✅ Timeout configured (5-10s): Failed fast, showed error message');
  } else {
    addLog('❌ No timeout configured: Requests hanging for 60+ seconds');
    timeoutConfigured = false;
  }
  await sleep(1000);

  // Check circuit breaker (simulated - would be in API Gateway or Server)
  if (hasApiGateway || servers.length > 0) {
    circuitBreaker = true;
    addLog('✅ Circuit breaker detected: Would stop calling slow API after 5 failures');
  } else {
    addLog('❌ No Circuit Breaker: All 100 server threads blocked, entire app frozen');
    circuitBreaker = false;
  }
  await sleep(1000);

  // Simulate thread pool depletion
  addLog('📊 Thread pool status:');
  for (let i = 0; i < 4; i++) {
    threadCount = Math.max(0, threadCount - (i === 0 ? 50 : i === 1 ? 40 : i === 2 ? 40 : 10));
    addLog(`   Available threads: ${threadCount === 0 ? '0 [DEADLOCK]' : threadCount}`);
    await sleep(800);
  }

  if (threadCount === 0) {
    addLog('💥 DEADLOCK: All threads blocked waiting for slow API');
    servers.forEach((server) => {
      const updated = updateNodeMetrics(server, 0, 0, 'CRITICAL', { threads: 0, deadlock: true });
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
    });
  }
  await sleep(1000);

  // Check Load Balancer
  if (hasLoadBalancer) {
    addLog('⚠️  All servers affected, health check failing');
    loadBalancers.forEach((lb) => {
      const updated = updateNodeMetrics(lb, 85, 80, 'WARNING');
      setNodes((nds) => nds.map((n) => (n.id === lb.id ? updated : n)));
    });
  }
  await sleep(800);

  // Check Retry Logic
  if (hasQueue) {
    retryLogic = true;
    addLog('✅ Requests queued for retry when API recovers');
    queues.forEach((queue) => {
      const updated = updateNodeMetrics(queue, 0, 0, 'WARNING', { retryQueue: true, retryCount: 45 });
      setNodes((nds) => nds.map((n) => (n.id === queue.id ? updated : n)));
    });
  } else {
    addLog('❌ No Retry Logic: Failed requests not retried, data lost');
  }
  await sleep(800);

  // Check Fallback
  const hasCache = nodes.some(n => n.type === 'cache');
  if (hasCache) {
    fallback = true;
    addLog('✅ Degraded mode: Cached payment methods offered');
    const caches = nodes.filter(n => n.type === 'cache');
    caches.forEach((cache) => {
      const updated = updateNodeMetrics(cache, 70, 65, 'WARNING', { fallbackMode: true });
      setNodes((nds) => nds.map((n) => (n.id === cache.id ? updated : n)));
    });
  } else {
    addLog('❌ No Fallback: Blank page shown to users');
  }
  await sleep(1000);

  addLog('💡 Circuit breaker would stop calling slow API after 5 failures');
  await sleep(800);

  if (timeoutConfigured && circuitBreaker && hasQueue) {
    addLog('✅ RECOVERED: Architecture handled slow API gracefully');
    return { success: true, message: 'RECOVERED: Slow API handled with timeouts and retries' };
  } else if (threadCount === 0) {
    addLog('❌ CRITICAL: Complete application freeze');
    return { success: false, message: 'CRITICAL: Slow API caused deadlock' };
  } else {
    addLog('⚠️  WARNING: Partial mitigation, some users affected');
    return { success: true, message: 'WARNING: Slow API partially mitigated' };
  }
}

// 🔓 Security Breach Scenario
export async function runSecurityBreachScenario(nodes, edges, setNodes, addLog) {
  addLog('🔓 SECURITY ALERT: SQL injection attempt detected');
  await sleep(1000);
  
  addLog("Malicious payload: ' OR '1'='1; DROP TABLE users;--");
  await sleep(1500);

  const apiGateways = nodes.filter((n) => n.type === 'apiGateway');
  const authServices = nodes.filter((n) => n.type === 'authService');
  const servers = nodes.filter((n) => n.type === 'server');
  const databases = nodes.filter((n) => n.type === 'database');
  const clients = nodes.filter((n) => n.type === 'client');

  const hasApiGateway = apiGateways.length > 0;
  const hasAuth = authServices.length > 0;
  const hasServer = servers.length > 0;

  let attacksBlocked = 0;
  let attacksSuccessful = 0;
  let breachSuccessful = false;

  // Check for direct Client→Database connection
  const directClientToDb = edges.some(e => {
    const source = nodes.find(n => n.id === e.source);
    const target = nodes.find(n => n.id === e.target);
    return source?.type === 'client' && target?.type === 'database';
  });

  if (directClientToDb) {
    addLog('❌ CRITICAL: Direct DB access, no security layer!');
    await sleep(1000);
    databases.forEach((db) => {
      const updated = updateNodeMetrics(db, 0, 0, 'CRITICAL', { vulnerable: true, breached: true });
      setNodes((nds) => nds.map((n) => (n.id === db.id ? updated : n)));
    });
    breachSuccessful = true;
    attacksSuccessful = 1;
    addLog('💥 Data compromised: 10,000 user records leaked');
    await sleep(1000);
    addLog('🚨 Estimated damage: $500,000 (GDPR fines + lawsuits)');
    return { success: false, message: 'CRITICAL: Security breach successful - direct DB access' };
  }
  await sleep(800);

  // Check API Gateway
  if (!hasApiGateway) {
    addLog('❌ Attack reached application directly');
    attacksSuccessful += 1;
  } else {
    attacksBlocked += 1;
    addLog('✅ WAF (Web Application Firewall) blocked 60% of attacks');
    apiGateways.forEach((gw) => {
      const updated = updateNodeMetrics(gw, 0, 0, 'HEALTHY', { attacksBlocked: 60, wafActive: true });
      setNodes((nds) => nds.map((n) => (n.id === gw.id ? updated : n)));
    });
  }
  await sleep(1000);

  // Check Auth Service
  if (!hasAuth) {
    addLog('❌ Unauthenticated access to database');
    attacksSuccessful += 1;
  } else {
    attacksBlocked += 1;
    addLog('✅ Request rejected: Invalid token');
    authServices.forEach((auth) => {
      const updated = updateNodeMetrics(auth, 0, 0, 'HEALTHY', { blocked: true, shieldActive: true });
      setNodes((nds) => nds.map((n) => (n.id === auth.id ? updated : n)));
    });
  }
  await sleep(1000);

  // Check Server middleware (input validation)
  if (hasServer) {
    attacksBlocked += 1;
    addLog('✅ Input validation caught malicious SQL');
    servers.forEach((server) => {
      const updated = updateNodeMetrics(server, 0, 0, 'HEALTHY', { inputValidation: true });
      setNodes((nds) => nds.map((n) => (n.id === server.id ? updated : n)));
    });
  } else {
    addLog('❌ No Input Validation: Malicious query executed: users table DROPPED!');
    attacksSuccessful += 1;
    breachSuccessful = true;
  }
  await sleep(1000);

  // Final assessment
  if (hasApiGateway && hasAuth && hasServer) {
    addLog('✅ Attack blocked, IP banned for 24h');
    addLog('🛡️  Security layers successfully defended against attack');
    return { success: true, message: 'RECOVERED: Security breach prevented' };
  } else if (breachSuccessful) {
    addLog('💥 Data compromised: 10,000 user records leaked');
    addLog('🚨 Estimated damage: $500,000 (GDPR fines + lawsuits)');
    return { success: false, message: 'CRITICAL: Security breach successful' };
  } else {
    addLog(`⚠️  ${attacksBlocked} attack(s) blocked, ${attacksSuccessful} attack(s) got through`);
    addLog('💡 Recommendation: Add missing security layers');
    return { success: true, message: 'WARNING: Partial security protection' };
  }
}

// 🌍 Regional Outage Scenario
export async function runRegionalOutageScenario(nodes, edges, setNodes, addLog) {
  addLog('🌍 DISASTER: AWS us-east-1 region completely offline!');
  await sleep(1500);
  
  addLog('⚠️  Affects: S3, EC2, RDS, CloudFront in us-east-1');
  await sleep(1000);

  // Check if nodes have region property (default to us-east-1 if not set)
  const nodesInRegion = nodes.filter(n => {
    const region = n.data?.region || 'us-east-1';
    return region === 'us-east-1';
  });

  const allNodesInOneRegion = nodesInRegion.length === nodes.length;
  const hasMultiRegion = nodes.some(n => {
    const region = n.data?.region || 'us-east-1';
    return region !== 'us-east-1';
  });

  // Mark all us-east-1 nodes as offline
  nodesInRegion.forEach((node) => {
    const updated = updateNodeMetrics(node, 0, 0, 'CRITICAL', { 
      regionOffline: true, 
      region: 'us-east-1' 
    });
    setNodes((nds) => nds.map((n) => (n.id === node.id ? updated : n)));
  });
  await sleep(1500);

  if (allNodesInOneRegion) {
    addLog('❌ TOTAL OUTAGE: 100% of users affected');
    await sleep(1000);
    addLog('⏱️  Downtime: 180 minutes (manual recovery)');
    addLog('👥 Users affected: 100%');
    addLog('💾 Data loss: 24 hours');
    addLog('💰 Revenue loss: $45,000');
    return { success: false, message: 'CRITICAL: Total regional outage - no redundancy' };
  }

  if (hasMultiRegion) {
    addLog('✅ Failover to us-west-2 in progress...');
    await sleep(1500);

    const cdns = nodes.filter(n => n.type === 'cdn');
    const databases = nodes.filter(n => n.type === 'database');
    const storages = nodes.filter(n => n.type === 'storage');

    const hasCDN = cdns.length > 0;
    const hasMultiRegionCDN = cdns.some(n => {
      const region = n.data?.region || 'us-east-1';
      return region !== 'us-east-1';
    });
    const hasMultiRegionDB = databases.some(n => {
      const region = n.data?.region || 'us-east-1';
      return region !== 'us-east-1';
    });
    const hasStorageReplication = storages.some(n => {
      const region = n.data?.region || 'us-east-1';
      return region !== 'us-east-1';
    });

    // Check CDN
    if (!hasCDN) {
      addLog('❌ Static assets unreachable');
    } else if (hasMultiRegionCDN) {
      addLog('✅ CDN serving cached content globally');
      cdns.filter(n => {
        const region = n.data?.region || 'us-east-1';
        return region !== 'us-east-1';
      }).forEach((cdn) => {
        const updated = updateNodeMetrics(cdn, 70, 65, 'WARNING', { serving: true, region: 'us-west-2' });
        setNodes((nds) => nds.map((n) => (n.id === cdn.id ? updated : n)));
      });
    }
    await sleep(1000);

    // Check Database
    if (databases.length === 1) {
      addLog('❌ All data inaccessible, no writes/reads possible');
    } else if (hasMultiRegionDB) {
      addLog('✅ Database replica in eu-west-1 promoted');
      databases.filter(n => {
        const region = n.data?.region || 'us-east-1';
        return region !== 'us-east-1';
      }).forEach((db) => {
        const updated = updateNodeMetrics(db, 60, 55, 'HEALTHY', { promoted: true, failover: true, region: 'eu-west-1' });
        setNodes((nds) => nds.map((n) => (n.id === db.id ? updated : n)));
      });
    }
    await sleep(1000);

    // Check DNS failover (simulated)
    const hasRoute53 = true; // Assume Route53 if multi-region
    if (hasRoute53) {
      addLog('✅ Automatic DNS failover in 60 seconds');
    } else {
      addLog('⚠️  Manual DNS update required (30 min downtime)');
    }
    await sleep(1000);

    // Check Storage replication
    if (!hasStorageReplication && storages.length > 0) {
      addLog('❌ User uploads from last 24h lost');
    } else if (hasStorageReplication) {
      addLog('✅ All data safe in backup region');
    }
    await sleep(1000);

    const downtime = hasRoute53 ? 1 : 30; // minutes
    const usersAffected = hasMultiRegionDB && hasMultiRegionCDN ? 5 : 25; // percentage
    const dataLoss = hasStorageReplication ? 0 : 24; // hours

    addLog(`⏱️  Downtime: ${downtime} minute(s)`);
    addLog(`👥 Users affected: ${usersAffected}%`);
    addLog(`💾 Data loss: ${dataLoss} hour(s)`);
    addLog(`💰 Revenue loss: $${Math.round(downtime * 250)}`);
    await sleep(1500);

    addLog('✅ Recovered: Traffic routed to us-west-2 + eu-west-1');
    await sleep(1000);
    addLog('⏱️  AWS us-east-1 restored after 4 hours');

    if (downtime <= 1 && usersAffected <= 5 && dataLoss === 0) {
      return { success: true, message: 'RECOVERED: Multi-region failover successful' };
    } else {
      return { success: true, message: 'WARNING: Multi-region failover with some impact' };
    }
  }

  return { success: false, message: 'CRITICAL: Regional outage - no multi-region setup' };
}

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
  const regions = new Set(nodes.map(n => n.data?.region || 'us-east-1'));

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

// Run scenario by ID
export async function runScenario(scenarioId, nodes, edges, setNodes, addLog) {
  switch (scenarioId) {
    case SCENARIOS.BLACK_FRIDAY.id:
      return await runBlackFridayScenario(nodes, edges, setNodes, addLog);
    case SCENARIOS.DB_CRASH.id:
      return await runDBCrashScenario(nodes, edges, setNodes, addLog);
    case SCENARIOS.SLOW_API.id:
      return await runSlowAPIScenario(nodes, edges, setNodes, addLog);
    case SCENARIOS.SECURITY_BREACH.id:
      return await runSecurityBreachScenario(nodes, edges, setNodes, addLog);
    case SCENARIOS.COST_OVERRUN.id:
      return await runCostOverrunScenario(nodes, edges, setNodes, addLog);
    case SCENARIOS.REGIONAL_OUTAGE.id:
      return await runRegionalOutageScenario(nodes, edges, setNodes, addLog);
    case SCENARIOS.CACHE_STORM.id:
      return await runCacheStormScenario(nodes, edges, setNodes, addLog);
    case SCENARIOS.DDOS_ATTACK.id:
      return await runDDoSScenario(nodes, edges, setNodes, addLog);
    default:
      addLog('❌ Unknown scenario');
      return { success: false, message: 'Unknown scenario' };
  }
}

