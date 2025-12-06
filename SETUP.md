# 🔧 Setup Guide

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd CloudCartel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your Groq API key (optional)
   # Get a free key from: https://console.groq.com
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Required
- `VITE_GROQ_API_KEY`: Your Groq API key for AI explanations
  - Get one free at [Groq Console](https://console.groq.com)
  - Add it to `.env` file: `VITE_GROQ_API_KEY=your_key_here`
  - Without this key, AI explanations will not work

## Security Notes

✅ **Safe to commit:**
- `.env.example` (template file)
- All source code
- Configuration files

❌ **Never commit:**
- `.env` (contains your actual API key)
- `node_modules/`
- `dist/` (build output)

The `.gitignore` file is already configured to exclude sensitive files.

## Troubleshooting

### API Key Issues
- If AI explanations aren't working, check that your `.env` file exists and contains `VITE_GROQ_API_KEY`
- Make sure the API key is valid and has not expired
- For production, always set your API key as an environment variable

### Build Issues
- Make sure all dependencies are installed: `npm install`
- Clear cache if needed: `rm -rf node_modules && npm install`

## Production Deployment

1. Set `VITE_GROQ_API_KEY` as an environment variable in your hosting platform
2. Build the app: `npm run build`
3. Deploy the `dist/` folder

**Note**: Always use environment variables for API keys in production. Never hardcode keys in source code.

