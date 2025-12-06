# CloudCartel Docker Startup Script for Windows

Write-Host "🚀 Starting CloudCartel with Docker..." -ForegroundColor Green

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is installed
try {
    $composeVersion = docker-compose --version
    $useCompose = $true
    Write-Host "✅ Docker Compose is installed: $composeVersion" -ForegroundColor Green
} catch {
    $useCompose = $false
    Write-Host "⚠️ Docker Compose is not installed, using docker commands directly" -ForegroundColor Yellow
}

if ($useCompose) {
    Write-Host "🏗️ Building and starting with docker-compose..." -ForegroundColor Cyan
    docker-compose up -d
} else {
    Write-Host "🔨 Building Docker image..." -ForegroundColor Cyan
    docker build -t cloud-cartel .
    Write-Host "🏃 Running container on port 80..." -ForegroundColor Cyan
    docker run -d -p 80:80 --name cloud-cartel cloud-cartel
}

Write-Host "✅ CloudCartel is now running!" -ForegroundColor Green
Write-Host "🌍 Visit http://localhost to access the application" -ForegroundColor Green
Write-Host "🛑 To stop the application, run: docker-compose down (or docker stop cloud-cartel)" -ForegroundColor Yellow