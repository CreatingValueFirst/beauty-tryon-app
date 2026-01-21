#!/bin/bash

# Makeup API - Quick Deployment Script
# This script helps deploy the makeup API to various platforms

set -e

echo "🚀 Makeup API Deployment Helper"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"

# Build Docker image
echo ""
echo "📦 Building Docker image..."
docker build -t makeup-api:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Test locally
echo ""
echo "🧪 Testing image locally..."
echo "Starting container on port 8000..."
docker run -d -p 8000:8000 --name makeup-api-test makeup-api:latest

# Wait for startup
echo "Waiting for service to start..."
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
if curl -f http://localhost:8000/health &> /dev/null; then
    echo -e "${GREEN}✓ Service is healthy${NC}"
    echo ""
    echo "Service is running at: http://localhost:8000"
    echo "API docs: http://localhost:8000/docs"
else
    echo -e "${RED}❌ Health check failed${NC}"
    docker logs makeup-api-test
    docker stop makeup-api-test
    docker rm makeup-api-test
    exit 1
fi

# Stop test container
echo ""
echo "Stopping test container..."
docker stop makeup-api-test
docker rm makeup-api-test

echo ""
echo -e "${GREEN}✅ Local test passed!${NC}"
echo ""
echo "============================================"
echo "📋 Next Steps - Choose Your Platform:"
echo "============================================"
echo ""
echo "1️⃣  RAILWAY (Recommended - Easiest)"
echo "   • npm install -g @railway/cli"
echo "   • railway login"
echo "   • railway init"
echo "   • railway up"
echo "   • Cost: \$5-20/month"
echo ""
echo "2️⃣  GOOGLE CLOUD RUN (Scalable)"
echo "   • gcloud builds submit --tag gcr.io/YOUR_PROJECT/makeup-api"
echo "   • gcloud run deploy makeup-api --image gcr.io/YOUR_PROJECT/makeup-api --platform managed --memory 2Gi"
echo "   • Cost: \$10-30/month"
echo ""
echo "3️⃣  AWS ECR + ECS (Enterprise)"
echo "   • aws ecr create-repository --repository-name makeup-api"
echo "   • docker tag makeup-api:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/makeup-api:latest"
echo "   • docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/makeup-api:latest"
echo "   • Create ECS service"
echo "   • Cost: \$30-60/month"
echo ""
echo "4️⃣  RENDER.COM (Simple)"
echo "   • Connect GitHub repo"
echo "   • Select Docker deployment"
echo "   • Auto-deploy on push"
echo "   • Cost: \$7-25/month"
echo ""
echo "5️⃣  FLY.IO (Global Edge)"
echo "   • fly launch"
echo "   • fly deploy"
echo "   • Cost: \$5-15/month"
echo ""
echo "============================================"
echo ""
echo "After deployment, copy the URL and add to Vercel:"
echo "  MAKEUP_API_URL=https://your-api-url.com"
echo ""
echo "See DEPLOYMENT_PLATFORMS.md for detailed guides"
echo ""
