// AI Mentor Integration - Calls Groq Llama API

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Get API key from environment variable only
// For local development: Create .env file with VITE_GROQ_API_KEY=your_key
// For production: Set environment variable or use CI/CD secrets
// NEVER hardcode API keys in source code
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_KEY = GROQ_API_KEY;

// Analyze architecture for educational feedback
function analyzeArchitecture(architecture, edges, scenarioId) {
  const componentCounts = {};
  architecture.forEach((node) => {
    componentCounts[node.type] = (componentCounts[node.type] || 0) + 1;
  });

  const connections = edges.map(e => {
    const source = architecture.find(n => n.id === e.source);
    const target = architecture.find(n => n.id === e.target);
    return `${source?.type} → ${target?.type}`;
  });

  const hasComponent = (type) => componentCounts[type] > 0;
  const countOf = (type) => componentCounts[type] || 0;

  const analysis = {
    components: Object.entries(componentCounts)
      .map(([type, count]) => `${type} (${count}x)`)
      .join(', ') || 'None',
    connections: connections.length > 0 ? connections.join(', ') : 'No connections',
    missing: [],
    recommendations: [],
  };

  // Black Friday recommendations
  if (scenarioId === 'black_friday') {
    if (!hasComponent('cdn')) analysis.missing.push('CDN');
    if (!hasComponent('loadBalancer')) analysis.missing.push('Load Balancer');
    if (countOf('server') < 2) analysis.recommendations.push(`Add more servers (currently ${countOf('server')}, recommend 3-4+)`);
    if (!hasComponent('cache')) analysis.missing.push('Cache');
  }

  // Database Crash recommendations
  if (scenarioId === 'db_crash') {
    if (!hasComponent('cache')) analysis.missing.push('Cache');
    if (countOf('database') < 2) analysis.recommendations.push(`Add a replica database (currently ${countOf('database')})`);
    if (!hasComponent('queue')) analysis.missing.push('Queue');
  }

  // Slow API recommendations
  if (scenarioId === 'slow_api') {
    if (!hasComponent('queue')) analysis.missing.push('Queue');
    if (!hasComponent('apiGateway')) analysis.missing.push('API Gateway');
    if (!hasComponent('cache')) analysis.recommendations.push('Cache (for fallback responses)');
  }

  // Security Breach recommendations
  if (scenarioId === 'security_breach') {
    if (!hasComponent('apiGateway')) analysis.missing.push('API Gateway (with WAF)');
    if (!hasComponent('authService')) analysis.missing.push('Auth Service');
    const directDbConnection = edges.some(e => {
      const source = architecture.find(n => n.id === e.source);
      const target = architecture.find(n => n.id === e.target);
      return source?.type === 'client' && target?.type === 'database';
    });
    if (directDbConnection) analysis.recommendations.push('Remove direct Client → Database connection');
  }

  // Cost Overrun recommendations
  if (scenarioId === 'cost_overrun') {
    if (!hasComponent('cdn')) analysis.missing.push('CDN');
    if (!hasComponent('cache')) analysis.missing.push('Cache');
    if (countOf('server') > 5) analysis.recommendations.push(`Consider auto-scaling (currently ${countOf('server')} always-on servers)`);
  }

  // Regional Outage recommendations
  if (scenarioId === 'regional_outage') {
    analysis.recommendations.push('Deploy components across multiple regions (us-east-1, us-west-2, eu-west-1)');
    if (countOf('database') < 2) analysis.recommendations.push('Add cross-region database replica');
  }

  return analysis;
}

export async function getAIExplanation(architecture, scenario, results, edges = []) {
  if (!API_KEY) {
    return {
      error: true,
      message: 'Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.',
    };
  }

  const analysis = analyzeArchitecture(architecture, edges, scenario.id);
  const componentList = analysis.components;
  const connectionList = analysis.connections;
  const missingComponents = analysis.missing.join(', ') || 'None';
  const recommendations = analysis.recommendations.join('; ') || 'None';

  // Scenario-specific learning objectives
  const scenarioLearning = {
    'black_friday': {
      what: 'traffic spike from 100 to 10,000 requests per second',
      why: 'CDN caches static files at the edge (closer to users), reducing server load. Load balancers distribute traffic across multiple servers so no single server gets overwhelmed. Cache stores frequently accessed data in fast memory, protecting your database from being flooded with queries.',
      connections: 'Client → CDN → Storage (for static files), Client → Load Balancer → Server → Cache → Database (for dynamic content)',
      experiment: 'Try removing the CDN and see how servers struggle. Then add it back and watch the difference!',
    },
    'db_crash': {
      what: 'primary database crashed due to hardware failure',
      why: 'Cache stores copies of database data in fast memory. When the database is down, cache can still serve 80% of read requests. A replica database is an exact copy that automatically takes over if the primary fails. Queues buffer write requests so nothing is lost during outages.',
      connections: 'Server → Cache → Database (reads), Server → Queue → Database (writes), Database → Database Replica (replication)',
      experiment: 'Try disconnecting the database and see how cache keeps serving data. Then add a replica and watch automatic failover!',
    },
    'slow_api': {
      what: 'external API became very slow (8 seconds instead of 200ms)',
      why: 'When an external API is slow, your servers wait for it, blocking all other requests. A queue lets you send requests asynchronously - your server doesn\'t wait, it just puts the request in a queue and continues. API Gateway can set timeouts to fail fast instead of waiting forever.',
      connections: 'Server → Queue → External API (async), Server → API Gateway → External API (with timeout)',
      experiment: 'Try connecting directly to a slow API and watch threads get blocked. Then add a queue and see how requests flow smoothly!',
    },
    'security_breach': {
      what: 'malicious SQL injection attack attempted',
      why: 'API Gateway has a Web Application Firewall (WAF) that blocks known attack patterns before they reach your app. Auth Service ensures only authenticated users can access data. Never connect Client directly to Database - always go through Server/API Gateway for security layers.',
      connections: 'Client → Auth Service → API Gateway → Server → Database (secure path), NEVER: Client → Database (direct)',
      experiment: 'Try connecting Client directly to Database and see the security warning. Then add API Gateway and Auth Service to see how attacks get blocked!',
    },
    'cost_overrun': {
      what: 'monthly costs spiked due to inefficient architecture',
      why: 'CDN reduces data transfer costs by serving files from edge locations (cheaper than your servers). Cache reduces database queries, saving on database costs. Right-sizing means using the right server size for your workload - not too big (wasteful) or too small (slow).',
      connections: 'Client → CDN → Storage (cheap static serving), Server → Cache → Database (reduces DB load)',
      experiment: 'Compare costs with and without CDN. Watch how cache reduces database load and costs!',
    },
    'regional_outage': {
      what: 'entire AWS region (us-east-1) went offline',
      why: 'Multi-region means your app runs in multiple geographic locations. If one region fails, traffic automatically routes to another. Database replication copies your data to multiple regions. DNS failover automatically redirects users to healthy regions.',
      connections: 'Client → DNS → Region 1 (primary), Client → DNS → Region 2 (failover), Database → Database Replica (cross-region)',
      experiment: 'Deploy components in multiple regions and simulate a region failure. Watch automatic failover happen!',
    },
  };

  const learning = scenarioLearning[scenario.id] || {
    what: 'a disaster scenario occurred',
    why: 'proper architecture design prevents failures',
    connections: 'Follow best practices for component connections',
    experiment: 'Experiment with different architectures to see what works best!',
  };

  const prompt = `You are a friendly, encouraging cloud architecture mentor teaching beginners. A student just ran the "${scenario.name}" simulation.

**CURRENT ARCHITECTURE:**
- Components: ${componentList}
- Connections: ${connectionList}
- Missing components: ${missingComponents}
- Recommendations: ${recommendations}

**WHAT HAPPENED:**
${learning.what}

**SIMULATION RESULTS:**
${results.logs.slice(-10).join('\n')}

**YOUR TASK:**
Provide a beginner-friendly, structured explanation in this EXACT format:

## 📚 What Happened?
[2-3 sentences explaining what happened in simple terms, like you're talking to a friend]

## 🎯 Why This Matters
[2-3 sentences explaining WHY this scenario is important, using simple analogies if helpful]

## ✅ What You Did Well
[1-2 sentences about what components/connections they have that helped]

## 🔧 What's Missing & How to Fix It

### Step 1: Add These Components
[List specific components to add, e.g., "Add a CDN component", "Add a Load Balancer", "Add 2 more Server components"]

### Step 2: Connect Them Like This
[Show specific connection paths, e.g., "Connect: Client → CDN → Storage", "Connect: Client → Load Balancer → Server → Database"]

### Step 3: Why Each Connection Matters
[For each connection, explain WHY in simple terms, e.g., "CDN → Storage: CDN caches files closer to users, reducing server load by 90%", "Load Balancer → Server: Distributes traffic so no single server gets overwhelmed"]

## 🧪 Try This Experiment
[${learning.experiment}]

## 💡 Key Takeaway
[1 sentence summarizing the most important lesson]

**STYLE GUIDE:**
- Use simple language (avoid jargon)
- Be encouraging and positive
- Use analogies when helpful
- Make it actionable (specific steps)
- Explain the "why" behind each recommendation
- Keep it friendly and educational

**IMPORTANT:** Format your response exactly as shown above with the section headers. Be specific about component names and connection paths.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const explanation = data.choices[0]?.message?.content || 'Unable to generate explanation.';

    if (!explanation || explanation.trim().length === 0) {
      console.warn('Empty explanation received from API');
      return {
        error: true,
        message: 'Empty response from AI',
      };
    }

    console.log('AI explanation received successfully, length:', explanation.length);
    return { error: false, explanation };
  } catch (error) {
    console.error('Error fetching AI explanation:', error);
    return { error: true, message: error.message || 'Failed to get AI explanation' };
  }
}

export function getFallbackExplanation(scenario, results, architecture = [], edges = []) {
  const scenarioName = scenario.name || 'the scenario';
  const isSuccess = results.message?.includes('RECOVERED') || results.message?.includes('successfully');
  
  const analysis = analyzeArchitecture(architecture, edges, scenario.id);
  const missingComponents = analysis.missing.length > 0 
    ? `\n\n**Missing Components:** ${analysis.missing.join(', ')}` 
    : '';

  if (isSuccess) {
    return `## 📚 What Happened?
Great job! Your architecture handled ${scenarioName} well. The system was able to recover or mitigate the issue, which shows good resilience planning.

## ✅ What You Did Well
You have the right components in place to handle this scenario. Keep experimenting to see how different architectures perform!

## 🔧 Next Steps
Consider adding monitoring to catch these issues early in production.${missingComponents}

## 💡 Key Takeaway
Resilient architecture design prevents failures before they happen!`;
  }

  return `## 📚 What Happened?
Your architecture struggled with ${scenarioName}. This is a learning opportunity! Every failure teaches us how to build better systems.

## 🔧 What's Missing & How to Fix It
${missingComponents || 'Consider adding redundancy layers, protection mechanisms, or scaling capabilities to improve resilience.'}

## 🧪 Try This Experiment
Try adding the missing components and running the simulation again. Watch how your architecture improves!

## 💡 Key Takeaway
Building resilient systems takes practice. Keep experimenting and learning from each simulation!`;
}
