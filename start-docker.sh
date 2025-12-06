#!/bin/bash

# CloudCartel Docker Startup Script

echo "🚀 Starting CloudCartel with Docker..."

# Check if docker is installed
if ! command -v docker &> /dev/null
then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo "⚠️  docker-compose is not installed, using docker commands directly"
    echo "🔨 Building Docker image..."
    docker build -t cloud-cartel .
    echo "🏃 Running container on port 80..."
    docker run -d -p 80:80 --name cloud-cartel cloud-cartel
else
    echo "🏗️  Building and starting with docker-compose..."
    docker-compose up -d
fi

echo "✅ CloudCartel is now running!"
echo "🌍 Visit http://localhost to access the application"
echo "🛑 To stop the application, run: docker-compose down (or docker stop cloud-cartel)"