// Cost Calculator - Estimates monthly cost based on nodes

const COST_RANGES = {
  client: { min: 0, max: 0 },
  cdn: { min: 40, max: 150 },
  apiGateway: { min: 30, max: 200 },
  loadBalancer: { min: 20, max: 100 },
  server: { min: 80, max: 300 },
  authService: { min: 0, max: 150 },
  database: { min: 120, max: 600 },
  cache: { min: 40, max: 200 },
  storage: { min: 15, max: 80 },
  queue: { min: 5, max: 50 },
};

export function calculateMonthlyCost(nodes) {
  const costsByType = {};
  
  nodes.forEach((node) => {
    const type = node.type;
    if (!costsByType[type]) {
      costsByType[type] = 0;
    }
    costsByType[type] += 1;
  });

  let totalMin = 0;
  let totalMax = 0;

  Object.entries(costsByType).forEach(([type, count]) => {
    const range = COST_RANGES[type] || { min: 0, max: 0 };
    totalMin += range.min * count;
    totalMax += range.max * count;
  });

  // Return average for display
  return Math.round((totalMin + totalMax) / 2);
}

