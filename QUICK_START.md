# Quick Start Guide 🚀

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## First Steps

1. **Build an Architecture**
   - Drag components from the left sidebar
   - Connect them by dragging from bottom handles to top handles
   - Watch the cost estimate update in real-time

2. **Run a Simulation**
   - Select a scenario from the right panel:
     - 🚀 Traffic Spike - Test load balancing
     - 💥 Database Crash - Test failover
     - 🔥 Cache Storm - Test cache dependencies
     - ⚔️ DDoS Attack - Test protection layers
   - Click "Run Simulation"
   - Watch nodes change status in real-time
   - Read the AI explanation

3. **Export Terraform**
   - Build your architecture
   - Click "Export Terraform" in the header
   - Download the `.tf` file
   - Use with `terraform apply` (after setting up AWS credentials)

## Example Architecture

Try building this:

```
Client → CDN → API Gateway → Load Balancer → Server(s)
                                      ↓
                                  Database
                                      ↓
                                    Cache
```

Then run the **Traffic Spike** scenario to see how it handles load!

## Optional: AI Explanations

To enable AI explanations, you need to add your Groq API key:

1. Get a free Groq API key from https://console.groq.com
2. Create `.env` file in project root:
   ```
   VITE_GROQ_API_KEY=your_groq_key_here
   ```
3. Restart the dev server

**Note**: Without the API key, AI explanations will not work. The app will show fallback explanations instead.

## Tips

- **Multiple Servers**: Load Balancer works best with 2+ servers
- **Cache Layer**: Helps reduce database load
- **CDN**: Blocks most DDoS traffic at edge
- **Replica Database**: Provides failover capability

Enjoy building! 🎉

