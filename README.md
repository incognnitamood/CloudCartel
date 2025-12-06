# CloudCartel 🚀

A beautiful, drag-and-drop visual architecture builder for cloud infrastructure with simulation, AI mentorship, and Infrastructure-as-Code export.

## ✨ Features

### 🎨 Visual Builder
- **ReactFlow-powered canvas** with smooth drag-and-drop interactions
- **10 Node Types**: Client/Browser, CDN, API Gateway, Load Balancer, Server, Auth Service, Database, Cache, Object Storage, Queue
- **Animated connections** with typed edges (Auth, Queue Messages, Storage Read/Write)
- **Snap-to-grid** functionality (20px grid)
- **Premium hover effects** and animations
- **Gradient node designs** with shimmer effects

### 🎮 Simulation Engine
- **4 Disaster Scenarios**:
  - 🚀 Traffic Spike (100 → 1000 req/s)
  - 💥 Database Crash (failover testing)
  - 🔥 Cache Storm (database overload)
  - ⚔️ DDoS Attack (50k malicious req/s)
- **Real-time status updates** (HEALTHY → WARNING → CRITICAL)
- **Live metrics** (CPU, Memory percentages)
- **Terminal-style logs** with step-by-step output
- **Visual animations** (pulsing nodes, color transitions)

### 🤖 AI Mentor Integration
- **Groq Llama API integration** for educational explanations
- **Post-simulation analysis** (what happened, what's missing, improvements)
- **Fallback mode** if API unavailable
- **Beautiful gradient UI** for AI responses

### 📦 Infrastructure-as-Code Export
- **Terraform generation** from visual architecture
- **Complete AWS resources** (EC2, RDS, S3, CloudFront, ElastiCache, SQS, API Gateway, etc.)
- **Proper configuration** (tags, variables, outputs)
- **One-click download** as `.tf` file

### 💰 Cost Management
- **Real-time cost calculator** based on components
- **Monthly estimate** displayed in header
- **Per-component cost ranges** shown in properties

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your Groq API key** (required for AI explanations):
   - Get a free API key from [Groq Console](https://console.groq.com)
   - Open `.env` and replace `your_groq_api_key_here` with your actual key:
     ```env
     VITE_GROQ_API_KEY=your_actual_api_key_here
     ```

> **Note**: The `.env` file is gitignored and will not be committed to version control. Never commit API keys to the repository.

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Docker Deployment

You can also run the application using Docker. See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for detailed instructions.

Quick start:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run with Docker directly
docker build -t cloud-cartel .
docker run -d -p 80:80 --name cloud-cartel cloud-cartel
```

The app will be available at `http://localhost`

For Windows users, you can also run the PowerShell script:
```bash
.\start-docker.ps1
```

For Linux/macOS users, you can run the bash script:
```bash
./start-docker.sh
```

## 📖 Usage

### Building Architecture
1. **Drag components** from the left palette onto the canvas
2. **Connect nodes** by dragging from bottom handle to top handle
3. **Watch costs update** automatically in the header

### Running Simulations
1. **Select a scenario** from the right panel (Traffic Spike, DB Crash, Cache Storm, DDoS)
2. **Click "Run Simulation"** to start
3. **Watch real-time updates** as nodes change status
4. **Read AI explanation** for educational insights

### Exporting Terraform
1. **Build your architecture** on the canvas
2. **Click "Export Terraform"** in the header
3. **Download** the generated `.tf` file
4. **Use with Terraform** to deploy your infrastructure

## 🎯 Architecture Validation

CloudCartel enforces best practices:

- ✅ Client must be entry point (no incoming connections)
- ✅ Database cannot connect directly to Client
- ✅ Queue requires producer (Server/API) and consumer (Server/Worker)
- ✅ CDN only serves Storage or cached API responses
- ✅ Load Balancer should have multiple servers (warning if only one)
- ✅ Auth Service recommended for Client → API/Server access

## 🎨 Component Categories

- **📦 Compute**: Server, API Gateway
- **💾 Data**: Database, Cache, Storage, Queue
- **🌐 Networking**: Load Balancer, CDN
- **🔐 Services**: Auth Service
- **👤 Entry**: Client/Browser

## 🛠️ Tech Stack

- React 18
- ReactFlow 11
- Tailwind CSS
- Vite
- Lucide React (icons)
- Groq Llama API for AI explanations

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Top header with cost & export
│   ├── SimulationPanel.jsx     # Right sidebar with scenarios
│   ├── AIExplanation.jsx       # AI mentor card
│   ├── NodePalette.jsx         # Left sidebar component list
│   └── NodeTypes.jsx           # Custom node components
├── utils/
│   ├── simulationEngine.js     # 4 disaster scenarios
│   ├── aiMentor.js             # Groq Llama API integration
│   ├── terraformGenerator.js   # Terraform code generation
│   ├── costCalculator.js       # Monthly cost calculation
│   └── architectureUtils.js    # Validation & metadata
└── App.jsx                     # Main application
```

## 🎓 Learning Features

- **Interactive simulations** teach resilience patterns
- **AI explanations** provide educational context
- **Validation rules** enforce best practices
- **Real-world scenarios** prepare for production

## 📚 Documentation

See [SIMULATION_FEATURES.md](./SIMULATION_FEATURES.md) for detailed documentation on:
- Simulation scenarios
- AI mentor integration
- Terraform generation
- UI/UX enhancements

## 🚧 Future Enhancements

- Real deployment integration
- User accounts & saved architectures
- More simulation scenarios
- Collaboration features
- Export to CloudFormation, Pulumi

## 📄 License

MIT

---

**Build. Simulate. Learn.** ☁️
