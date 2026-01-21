# Deployment Platform Guide for Makeup Try-On API

This comprehensive guide covers deploying the Makeup Try-On API to five different cloud platforms, from beginner-friendly to enterprise-grade solutions.

## Table of Contents
- [Railway](#1-railway-recommended-for-beginners)
- [Google Cloud Run](#2-google-cloud-run-recommended-for-production)
- [Render.com](#3-rendercom-simple-alternative)
- [Fly.io](#4-flyio-edge-deployment)
- [AWS ECS/Fargate](#5-aws-ecsfargate-enterprise)
- [Adding API URL to Vercel](#adding-api-url-to-vercel)

---

## 1. Railway (Recommended for Beginners)

**Best for**: Quick deployment, hobby projects, development environments

### Prerequisites
- GitHub account
- Credit/debit card (free tier available)

### Pros
- ✅ Easiest deployment process
- ✅ Generous free tier ($5/month credit)
- ✅ Automatic HTTPS
- ✅ Built-in monitoring
- ✅ Zero configuration needed

### Cons
- ❌ More expensive at scale (~$10-30/month)
- ❌ Limited geographic regions
- ❌ Less enterprise features

### Expected Costs
- **Free Tier**: $5/month credit (includes ~550 hours of usage)
- **Paid**: ~$0.000463/GB-second + $0.000231/vCPU-second
- **Estimated**: $10-25/month for moderate usage

### Step-by-Step Deployment

#### Step 1: Install Railway CLI
```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Or using npm
npm install -g @railway/cli

# Verify installation
railway --version
```

#### Step 2: Login to Railway
```bash
railway login
```
This will open your browser to authenticate with GitHub.

#### Step 3: Navigate to Your Project
```bash
cd /Users/carpediem/beauty-tryon-app/apps/api/makeup
```

#### Step 4: Initialize Railway Project
```bash
# Create new project
railway init

# Follow prompts:
# 1. Choose "Empty Project"
# 2. Name it "makeup-api" (or your preferred name)
```

#### Step 5: Link to Railway
```bash
railway link
```

#### Step 6: Deploy
```bash
railway up
```

Railway will automatically:
- Detect your Dockerfile
- Build the container
- Deploy to the cloud
- Generate a public URL

#### Step 7: Get Your API URL
```bash
railway domain
```

Or run:
```bash
railway status
```

Your API will be available at: `https://makeup-api-production-xxxx.up.railway.app`

#### Step 8: Set Environment Variables (if needed)
```bash
# Add environment variables
railway variables set PORT=8000
railway variables set ENVIRONMENT=production

# Or set via Railway Dashboard
railway open
# Go to Variables tab and add variables there
```

#### Step 9: Verify Deployment
```bash
# Test health endpoint
curl https://your-railway-url.up.railway.app/health

# Expected response:
# {"status":"healthy","service":"makeup-api"}
```

#### Monitoring and Logs
```bash
# View logs
railway logs

# Open dashboard
railway open
```

### Updating Your Deployment
```bash
# After making code changes
railway up

# Or enable auto-deployment from GitHub
# (configure in Railway dashboard)
```

---

## 2. Google Cloud Run (Recommended for Production)

**Best for**: Production workloads, scalable applications, cost optimization

### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed
- Docker installed locally

### Pros
- ✅ Pay-per-use (only charged when processing requests)
- ✅ Auto-scales to zero (no idle costs)
- ✅ Extremely scalable (1000+ concurrent requests)
- ✅ Global deployment options
- ✅ Generous free tier (2M requests/month)

### Cons
- ❌ More complex setup
- ❌ Cold start delays (1-3 seconds)
- ❌ Requires GCP knowledge

### Expected Costs
- **Free Tier**: 2M requests/month, 360,000 GB-seconds/month
- **Beyond Free Tier**:
  - $0.00002400/request
  - $0.00001800/GB-second
  - $0.00000900/vCPU-second
- **Estimated**: $5-15/month for moderate production usage

### Step-by-Step Deployment

#### Step 1: Install Google Cloud SDK
```bash
# macOS
brew install --cask google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version
```

#### Step 2: Initialize and Login
```bash
# Login to your Google account
gcloud auth login

# Set your project (or create new one)
gcloud projects create makeup-api-prod --name="Makeup API"

# Set active project
gcloud config set project makeup-api-prod

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### Step 3: Configure Docker Authentication
```bash
gcloud auth configure-docker
```

#### Step 4: Navigate to Project Directory
```bash
cd /Users/carpediem/beauty-tryon-app/apps/api/makeup
```

#### Step 5: Set Environment Variables
```bash
# Set your project ID (replace with your actual project ID)
export PROJECT_ID=makeup-api-prod
export REGION=us-central1
export SERVICE_NAME=makeup-api
```

#### Step 6: Build and Push Docker Image to GCR
```bash
# Build the Docker image
docker build -t gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest .

# Push to Google Container Registry
docker push gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest
```

**Alternative: Use Cloud Build** (no local Docker needed)
```bash
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest
```

#### Step 7: Deploy to Cloud Run
```bash
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8000
```

**Configuration Explanation:**
- `--memory 2Gi`: Allocate 2GB RAM (required for ML models)
- `--cpu 2`: 2 vCPUs for better performance
- `--timeout 300`: 5-minute timeout for processing
- `--concurrency 80`: Up to 80 requests per instance
- `--min-instances 0`: Scale to zero when idle (save costs)
- `--max-instances 10`: Max 10 instances during high traffic
- `--allow-unauthenticated`: Public access (remove for private API)

#### Step 8: Get Your API URL
```bash
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
```

Your API will be at: `https://makeup-api-xxxxxxxxxxxx-uc.a.run.app`

#### Step 9: Verify Deployment
```bash
# Get the URL
export API_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

# Test health endpoint
curl ${API_URL}/health

# Test full API
curl ${API_URL}/api/makeup/colors
```

#### Step 10: Set Environment Variables (if needed)
```bash
gcloud run services update ${SERVICE_NAME} \
  --region ${REGION} \
  --set-env-vars "ENVIRONMENT=production,LOG_LEVEL=info"
```

### Custom Domain Setup

#### Step 1: Map Custom Domain
```bash
gcloud run domain-mappings create \
  --service ${SERVICE_NAME} \
  --domain api.yourdomain.com \
  --region ${REGION}
```

#### Step 2: Update DNS Records
Follow the instructions provided by Cloud Run to add DNS records to your domain provider.

### Monitoring and Logs
```bash
# View logs
gcloud run logs read ${SERVICE_NAME} --region ${REGION} --limit 50

# Stream live logs
gcloud run logs tail ${SERVICE_NAME} --region ${REGION}

# Open Cloud Console
gcloud run services describe ${SERVICE_NAME} --region ${REGION}
```

### Updating Your Deployment
```bash
# Rebuild and redeploy
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest && \
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest \
  --region ${REGION} \
  --platform managed
```

### Cost Optimization Tips
1. **Enable CPU throttling** (CPU only allocated during requests):
   ```bash
   gcloud run services update ${SERVICE_NAME} \
     --region ${REGION} \
     --cpu-throttling
   ```

2. **Set appropriate min-instances**:
   - Development: `--min-instances 0` (scale to zero)
   - Production: `--min-instances 1` (eliminate cold starts)

3. **Monitor usage**:
   ```bash
   gcloud run services describe ${SERVICE_NAME} --region ${REGION}
   ```

---

## 3. Render.com (Simple Alternative)

**Best for**: Developers who want GitHub integration without complexity

### Prerequisites
- GitHub account
- Repository with your code

### Pros
- ✅ Simple GitHub integration
- ✅ Auto-deploy on push
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy environment variable management

### Cons
- ❌ Free tier spins down after 15 minutes (slow cold starts)
- ❌ Limited to US/EU regions
- ❌ Can be expensive for production

### Expected Costs
- **Free Tier**: Available but spins down after inactivity
- **Starter**: $7/month (512MB RAM)
- **Standard**: $25/month (2GB RAM) - **Recommended for this API**
- **Pro**: $85/month (4GB RAM)

### Step-by-Step Deployment

#### Step 1: Push Code to GitHub
```bash
cd /Users/carpediem/beauty-tryon-app/apps/api/makeup

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Makeup API"

# Create GitHub repo and push
# (Replace with your GitHub username)
gh repo create makeup-api --public --source=. --remote=origin --push

# Or push to existing repo
git remote add origin https://github.com/YOUR_USERNAME/makeup-api.git
git branch -M main
git push -u origin main
```

#### Step 2: Sign Up for Render
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub

#### Step 3: Create New Web Service
1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository
4. Select the `makeup-api` repository

#### Step 4: Configure Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `makeup-api`
- **Region**: Choose closest to your users (US West, US East, EU)
- **Branch**: `main`
- **Root Directory**: Leave blank (or set to `apps/api/makeup` if deploying from monorepo)

**Build Settings:**
- **Runtime**: `Docker`
- **Dockerfile Path**: `./Dockerfile`
- Render will auto-detect your Dockerfile

**Service Settings:**
- **Instance Type**: `Standard` ($25/month, 2GB RAM) - **Required for ML models**
- **Environment**: `Docker`

**Advanced Settings:**
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes` (deploy on every push)

#### Step 5: Add Environment Variables (Optional)
In the "Environment" section, add:
```
ENVIRONMENT=production
LOG_LEVEL=info
```

#### Step 6: Deploy
Click "Create Web Service" - Render will:
1. Clone your repository
2. Build the Docker image
3. Deploy the container
4. Provision a URL

Build takes ~5-10 minutes for first deployment.

#### Step 7: Get Your API URL
Your service will be available at:
```
https://makeup-api-xxxx.onrender.com
```

Find it in the Render dashboard under your service.

#### Step 8: Verify Deployment
```bash
# Test health endpoint
curl https://makeup-api-xxxx.onrender.com/health

# Test colors endpoint
curl https://makeup-api-xxxx.onrender.com/api/makeup/colors
```

#### Step 9: Configure Health Checks
In Render dashboard:
1. Go to your service
2. Click "Settings"
3. Under "Health & Alerts":
   - **Health Check Path**: `/health`
   - **Health Check Interval**: `30 seconds`
4. Click "Save Changes"

### Auto-Deploy Setup
Render automatically deploys on every git push to your main branch.

To manually trigger deploy:
```bash
# Make changes to your code
git add .
git commit -m "Update API"
git push origin main

# Render will automatically detect and deploy
```

### Custom Domain Setup
1. Go to your service in Render dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain: `api.yourdomain.com`
4. Update DNS records with provided values:
   ```
   CNAME api.yourdomain.com → makeup-api-xxxx.onrender.com
   ```

### Monitoring and Logs
```bash
# View logs in dashboard or use CLI
curl -H "Authorization: Bearer YOUR_RENDER_API_KEY" \
  https://api.render.com/v1/services/YOUR_SERVICE_ID/logs
```

Or view in Render dashboard → "Logs" tab

### Important Notes
- **Free Tier Limitation**: Free services spin down after 15 minutes of inactivity, causing 30-60 second cold starts
- **Recommendation**: Use at least "Starter" tier ($7/month) for 24/7 availability
- **This API Needs**: "Standard" tier ($25/month) minimum due to 2GB memory requirement

---

## 4. Fly.io (Edge Deployment)

**Best for**: Global edge deployment, low latency, developers who want fine control

### Prerequisites
- Credit card (free tier available)
- flyctl CLI installed

### Pros
- ✅ Edge deployment (deploy close to users globally)
- ✅ Generous free tier (3GB RAM across all apps)
- ✅ Fast deployment
- ✅ Excellent documentation
- ✅ IPv6 support

### Cons
- ❌ More complex configuration
- ❌ Requires learning fly.toml
- ❌ Limited support on free tier

### Expected Costs
- **Free Tier**: Up to 3 shared-cpu-1x VMs with 256MB RAM each
- **Paid**:
  - Shared CPU 1x: $0.0000008/second (~$2/month)
  - 1GB RAM: $0.0000002/second (~$0.50/month per GB)
- **Estimated**: $5-15/month for single region, $15-40/month for multi-region

### Step-by-Step Deployment

#### Step 1: Install Fly CLI
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export FLYCTL_INSTALL="/Users/carpediem/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Reload shell
source ~/.zshrc

# Verify installation
flyctl version
```

#### Step 2: Sign Up and Login
```bash
flyctl auth signup
# Or if you have an account:
flyctl auth login
```

#### Step 3: Navigate to Project
```bash
cd /Users/carpediem/beauty-tryon-app/apps/api/makeup
```

#### Step 4: Initialize Fly App
```bash
flyctl launch

# Answer prompts:
# - App name: makeup-api (or leave blank for random)
# - Region: Choose closest to your users
# - Would you like to set up Postgresql: No
# - Would you like to deploy now: No (we'll configure first)
```

This creates a `fly.toml` configuration file.

#### Step 5: Configure fly.toml
Replace the generated `fly.toml` with this optimized configuration:

```toml
# fly.toml - Fly.io configuration for Makeup API

app = "makeup-api"
primary_region = "sjc"  # Change to your preferred region

[build]
  # Use existing Dockerfile
  dockerfile = "Dockerfile"

[env]
  PORT = "8000"
  ENVIRONMENT = "production"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0  # Scale to zero when idle
  processes = ["app"]

  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

[[http_service.checks]]
  interval = "30s"
  timeout = "10s"
  grace_period = "10s"
  method = "GET"
  path = "/health"

[vm]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 2048  # 2GB RAM required for ML models

[[mounts]]
  # No persistent storage needed
```

**Configuration Explanation:**
- `primary_region`: Deploy location (see regions with `flyctl regions list`)
- `auto_stop_machines`: Scale to zero when idle (save costs)
- `auto_start_machines`: Auto-wake on requests
- `memory_mb = 2048`: 2GB RAM for MediaPipe models
- `hard_limit = 250`: Max concurrent requests

#### Step 6: Deploy to Fly.io
```bash
flyctl deploy

# Monitor deployment
flyctl logs
```

Deployment takes ~5-10 minutes for first build.

#### Step 7: Get Your API URL
```bash
flyctl info

# Or get just the hostname
flyctl info --json | grep hostname
```

Your API will be at: `https://makeup-api.fly.dev`

#### Step 8: Verify Deployment
```bash
# Test health check
curl https://makeup-api.fly.dev/health

# Test API
curl https://makeup-api.fly.dev/api/makeup/colors
```

#### Step 9: Set Secrets (Environment Variables)
```bash
# Add secrets
flyctl secrets set API_KEY=your_secret_key
flyctl secrets set ENVIRONMENT=production

# List secrets
flyctl secrets list
```

### Scaling Options

#### Scale to Multiple Regions (Global Edge Deployment)
```bash
# Add regions for global coverage
flyctl regions add ams  # Amsterdam
flyctl regions add syd  # Sydney
flyctl regions add gru  # São Paulo

# List active regions
flyctl regions list

# Remove a region
flyctl regions remove ams
```

#### Scale VM Resources
```bash
# Scale memory
flyctl scale memory 4096  # 4GB RAM

# Scale CPU
flyctl scale vm shared-cpu-2x  # 2x CPU

# Scale instances
flyctl scale count 3  # Run 3 instances minimum
```

#### Auto-scaling Configuration
Edit `fly.toml`:
```toml
[http_service]
  min_machines_running = 1  # Always keep 1 running
  auto_stop_machines = false  # Never stop machines
```

### Custom Domain Setup
```bash
# Add custom domain
flyctl certs add api.yourdomain.com

# Check certificate status
flyctl certs show api.yourdomain.com

# Add DNS records
# CNAME: api.yourdomain.com → makeup-api.fly.dev
```

### Monitoring and Logs
```bash
# View logs (live)
flyctl logs

# View specific app logs
flyctl logs -a makeup-api

# Monitor status
flyctl status

# Check resource usage
flyctl vm status
```

### Updating Your Deployment
```bash
# After code changes
flyctl deploy

# Deploy with specific tag
flyctl deploy --build-arg VERSION=1.2.3

# Rollback to previous version
flyctl releases list
flyctl releases rollback <version>
```

### Cost Optimization
```bash
# Scale to zero when idle (edit fly.toml)
[http_service]
  auto_stop_machines = true
  min_machines_running = 0

# Use smallest VM that works
flyctl scale vm shared-cpu-1x --memory 2048
```

---

## 5. AWS ECS/Fargate (Enterprise)

**Best for**: Enterprise applications, existing AWS infrastructure, maximum control

### Prerequisites
- AWS account
- AWS CLI installed and configured
- Docker installed
- IAM permissions for ECS, ECR, and related services

### Pros
- ✅ Enterprise-grade reliability
- ✅ Deep AWS integration
- ✅ Advanced networking options
- ✅ Comprehensive monitoring (CloudWatch)
- ✅ Fine-grained security controls

### Cons
- ❌ Most complex setup
- ❌ Steeper learning curve
- ❌ More expensive (no generous free tier)
- ❌ Requires AWS expertise

### Expected Costs
- **Fargate Pricing** (per hour):
  - 0.5 vCPU: $0.02401/hour
  - 2GB memory: $0.00532/hour
  - **Total**: ~$0.03/hour = ~$22/month per task
- **Additional Costs**:
  - Application Load Balancer: ~$16/month + data transfer
  - Data transfer: $0.09/GB (first 10TB)
  - ECR storage: $0.10/GB-month
- **Estimated Total**: $40-80/month for production setup

### Step-by-Step Deployment

#### Step 1: Install and Configure AWS CLI
```bash
# Install AWS CLI
# macOS
brew install awscli

# Verify installation
aws --version

# Configure AWS credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1 (or your preferred region)
# - Default output format: json
```

#### Step 2: Set Environment Variables
```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REPOSITORY=makeup-api
export ECS_CLUSTER=makeup-api-cluster
export ECS_SERVICE=makeup-api-service
export TASK_FAMILY=makeup-api-task
```

#### Step 3: Create ECR Repository
```bash
# Create private repository for Docker images
aws ecr create-repository \
  --repository-name ${ECR_REPOSITORY} \
  --region ${AWS_REGION}

# Get repository URI
export ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"
echo "ECR URI: ${ECR_URI}"
```

#### Step 4: Authenticate Docker to ECR
```bash
# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

#### Step 5: Build and Push Docker Image
```bash
# Navigate to project
cd /Users/carpediem/beauty-tryon-app/apps/api/makeup

# Build Docker image
docker build -t ${ECR_REPOSITORY}:latest .

# Tag for ECR
docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:latest

# Push to ECR
docker push ${ECR_URI}:latest
```

#### Step 6: Create ECS Cluster
```bash
# Create Fargate cluster
aws ecs create-cluster \
  --cluster-name ${ECS_CLUSTER} \
  --region ${AWS_REGION} \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
```

#### Step 7: Create IAM Role for ECS Task
```bash
# Create trust policy
cat > ecs-task-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create execution role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-trust-policy.json

# Attach policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Get role ARN
export EXECUTION_ROLE_ARN=$(aws iam get-role --role-name ecsTaskExecutionRole --query 'Role.Arn' --output text)
```

#### Step 8: Create Task Definition
```bash
# Create task definition JSON
cat > task-definition.json <<EOF
{
  "family": "${TASK_FAMILY}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "${EXECUTION_ROLE_ARN}",
  "containerDefinitions": [
    {
      "name": "makeup-api",
      "image": "${ECR_URI}:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/${TASK_FAMILY}",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ${AWS_REGION}
```

#### Step 9: Create Application Load Balancer

**Note**: This requires a VPC. Use default VPC or create new one.

```bash
# Get default VPC
export VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)

# Get subnets
export SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --query "Subnets[*].SubnetId" --output text | tr '\t' ',')

# Create security group for ALB
export ALB_SG=$(aws ec2 create-security-group \
  --group-name makeup-api-alb-sg \
  --description "Security group for Makeup API ALB" \
  --vpc-id ${VPC_ID} \
  --query 'GroupId' \
  --output text)

# Allow inbound HTTP and HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id ${ALB_SG} \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id ${ALB_SG} \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Create security group for ECS tasks
export ECS_SG=$(aws ec2 create-security-group \
  --group-name makeup-api-ecs-sg \
  --description "Security group for Makeup API ECS tasks" \
  --vpc-id ${VPC_ID} \
  --query 'GroupId' \
  --output text)

# Allow inbound from ALB
aws ec2 authorize-security-group-ingress \
  --group-id ${ECS_SG} \
  --protocol tcp \
  --port 8000 \
  --source-group ${ALB_SG}

# Create Application Load Balancer
export ALB_ARN=$(aws elbv2 create-load-balancer \
  --name makeup-api-alb \
  --subnets $(echo $SUBNET_IDS | tr ',' ' ') \
  --security-groups ${ALB_SG} \
  --scheme internet-facing \
  --type application \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Get ALB DNS name
export ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns ${ALB_ARN} \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo "Load Balancer DNS: ${ALB_DNS}"

# Create target group
export TG_ARN=$(aws elbv2 create-target-group \
  --name makeup-api-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id ${VPC_ID} \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn ${ALB_ARN} \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=${TG_ARN}
```

#### Step 10: Create ECS Service
```bash
# Create service
aws ecs create-service \
  --cluster ${ECS_CLUSTER} \
  --service-name ${ECS_SERVICE} \
  --task-definition ${TASK_FAMILY} \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[$(echo $SUBNET_IDS | sed 's/,/,/g')],securityGroups=[${ECS_SG}],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=${TG_ARN},containerName=makeup-api,containerPort=8000" \
  --health-check-grace-period-seconds 60
```

#### Step 11: Get Your API URL
```bash
echo "Your API is available at: http://${ALB_DNS}"

# Wait for tasks to be healthy (may take 2-3 minutes)
aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE} \
  --query 'services[0].deployments[0].rolloutState'
```

#### Step 12: Verify Deployment
```bash
# Check service status
aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE}

# Test health endpoint
curl http://${ALB_DNS}/health

# Test API
curl http://${ALB_DNS}/api/makeup/colors
```

### Custom Domain and HTTPS Setup

#### Step 1: Request SSL Certificate
```bash
# Request ACM certificate
aws acm request-certificate \
  --domain-name api.yourdomain.com \
  --validation-method DNS \
  --region ${AWS_REGION}

# Follow DNS validation instructions in ACM console
```

#### Step 2: Add HTTPS Listener
```bash
# Get certificate ARN (after validation)
export CERT_ARN=$(aws acm list-certificates --query 'CertificateSummaryList[?DomainName==`api.yourdomain.com`].CertificateArn' --output text)

# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn ${ALB_ARN} \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=${CERT_ARN} \
  --default-actions Type=forward,TargetGroupArn=${TG_ARN}
```

#### Step 3: Update DNS
Add a CNAME record:
```
CNAME: api.yourdomain.com → ${ALB_DNS}
```

### Monitoring and Logs

#### View Logs
```bash
# View CloudWatch logs
aws logs tail "/ecs/${TASK_FAMILY}" --follow

# Get recent logs
aws logs tail "/ecs/${TASK_FAMILY}" --since 1h
```

#### Monitor Service
```bash
# Check service status
aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE}

# List tasks
aws ecs list-tasks \
  --cluster ${ECS_CLUSTER} \
  --service-name ${ECS_SERVICE}
```

### Updating Your Deployment

```bash
# Build and push new image
docker build -t ${ECR_REPOSITORY}:v2 .
docker tag ${ECR_REPOSITORY}:v2 ${ECR_URI}:v2
docker push ${ECR_URI}:v2

# Update task definition (change image tag in task-definition.json)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Update service
aws ecs update-service \
  --cluster ${ECS_CLUSTER} \
  --service ${ECS_SERVICE} \
  --task-definition ${TASK_FAMILY} \
  --force-new-deployment
```

### Scaling

#### Auto-scaling Configuration
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/${ECS_CLUSTER}/${ECS_SERVICE} \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/${ECS_CLUSTER}/${ECS_SERVICE} \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name makeup-api-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

Create `scaling-policy.json`:
```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleInCooldown": 300,
  "ScaleOutCooldown": 60
}
```

### Clean Up Resources (to avoid charges)
```bash
# Delete service
aws ecs delete-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --force

# Delete cluster
aws ecs delete-cluster --cluster ${ECS_CLUSTER}

# Delete load balancer
aws elbv2 delete-load-balancer --load-balancer-arn ${ALB_ARN}

# Delete target group (wait 5 minutes after deleting ALB)
aws elbv2 delete-target-group --target-group-arn ${TG_ARN}

# Delete ECR repository
aws ecr delete-repository --repository-name ${ECR_REPOSITORY} --force
```

---

## Adding API URL to Vercel

After deploying to any platform above, you need to add the API URL to your Vercel web app.

### Method 1: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Select your project (`beauty-tryon-app` or `web`)
3. Go to "Settings" → "Environment Variables"
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your API URL (e.g., `https://makeup-api-production.up.railway.app`)
   - **Environment**: Select "Production", "Preview", and "Development"
5. Click "Save"
6. **Redeploy**: Go to "Deployments" → Select latest → Click "..." → "Redeploy"

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Login
vercel login

# Navigate to your web app
cd /Users/carpediem/beauty-tryon-app/apps/web

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL

# When prompted:
# - Enter value: https://your-api-url.com
# - Select environments: Production, Preview, Development

# Pull latest environment variables
vercel env pull

# Redeploy
vercel --prod
```

### Method 3: Using .env File (Local Development)

```bash
# Create/update .env.local in your web app
cd /Users/carpediem/beauty-tryon-app/apps/web

cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=https://your-api-url.com
EOF

# For production, still use Vercel dashboard or CLI
```

### Verify Integration

After redeploying, test your web app:

```bash
# Check if environment variable is available
# In your Next.js app console:
console.log(process.env.NEXT_PUBLIC_API_URL)

# Test API connection from web app
# Your web app should now call: ${NEXT_PUBLIC_API_URL}/api/makeup/apply
```

### Multiple Environment URLs

For different environments:

```bash
# Production
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://makeup-api.production.com

# Preview (staging)
vercel env add NEXT_PUBLIC_API_URL preview
# Enter: https://makeup-api-staging.up.railway.app

# Development
vercel env add NEXT_PUBLIC_API_URL development
# Enter: http://localhost:8000
```

---

## Platform Comparison Summary

| Platform | Difficulty | Cost/Month | Best For | Deployment Time |
|----------|-----------|------------|----------|-----------------|
| **Railway** | ⭐ Easy | $10-25 | Beginners, MVPs | 5 minutes |
| **Google Cloud Run** | ⭐⭐ Medium | $5-15 | Production, scale | 15 minutes |
| **Render.com** | ⭐ Easy | $25+ | GitHub workflows | 10 minutes |
| **Fly.io** | ⭐⭐ Medium | $5-15 | Edge deployment | 15 minutes |
| **AWS ECS/Fargate** | ⭐⭐⭐ Hard | $40-80 | Enterprise | 30-45 minutes |

### Quick Recommendations

**Just starting out?** → Use **Railway** or **Render.com**

**Production app with traffic?** → Use **Google Cloud Run**

**Need global edge deployment?** → Use **Fly.io**

**Enterprise with AWS infrastructure?** → Use **AWS ECS/Fargate**

**Tightest budget?** → Use **Google Cloud Run** (pay-per-use) or **Fly.io** (scale to zero)

---

## Common Issues and Troubleshooting

### 1. Out of Memory Errors
**Symptom**: Container crashes, 137 exit code
**Solution**: Increase memory allocation to at least 2GB
```bash
# Railway: Upgrade plan
# Cloud Run: --memory 2Gi
# Render: Use Standard plan ($25/month)
# Fly.io: memory_mb = 2048
# AWS: "memory": "2048" in task definition
```

### 2. Cold Start Timeouts
**Symptom**: First request times out or takes >30 seconds
**Solution**:
- Keep minimum 1 instance running (costs more)
- Increase timeout limits
- Use lighter ML models (if possible)

### 3. Health Check Failures
**Symptom**: Service deploys but shows unhealthy
**Solution**: Check logs and ensure `/health` endpoint returns 200 OK
```bash
# Test locally first
docker run -p 8000:8000 makeup-api
curl http://localhost:8000/health
```

### 4. CORS Errors
**Symptom**: Web app can't connect to API
**Solution**: Update CORS settings in `main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. Build Failures
**Symptom**: Docker build fails
**Solution**:
- Check Docker logs
- Ensure all dependencies in requirements-api.txt
- Build locally first to test

```bash
# Test build locally
cd /Users/carpediem/beauty-tryon-app/apps/api/makeup
docker build -t test-makeup-api .
docker run -p 8000:8000 test-makeup-api
```

---

## Performance Optimization Tips

1. **Use CDN for static assets**: If serving images, use Cloudflare or AWS CloudFront
2. **Enable response compression**: Already enabled in FastAPI
3. **Implement caching**: Cache processed images with Redis
4. **Use async processing**: For batch operations, use background tasks
5. **Monitor performance**: Set up monitoring (DataDog, New Relic, or built-in platform monitoring)

---

## Security Best Practices

1. **Add API key authentication**:
```python
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

API_KEY_HEADER = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key
```

2. **Rate limiting**: Use `slowapi` or platform rate limiting
3. **HTTPS only**: Enforce HTTPS in production
4. **Update dependencies**: Regularly update to patch security vulnerabilities
5. **Secrets management**: Use platform secret management (not hardcoded)

---

## Support and Resources

### Railway
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Google Cloud Run
- Docs: https://cloud.google.com/run/docs
- Pricing: https://cloud.google.com/run/pricing

### Render.com
- Docs: https://render.com/docs
- Community: https://community.render.com

### Fly.io
- Docs: https://fly.io/docs
- Community: https://community.fly.io

### AWS ECS
- Docs: https://docs.aws.amazon.com/ecs
- Forums: https://forums.aws.amazon.com

---

## Next Steps

After deploying your API:

1. ✅ Verify health endpoint works
2. ✅ Test makeup application with sample image
3. ✅ Add API URL to Vercel environment variables
4. ✅ Update CORS settings for your domain
5. ✅ Set up monitoring and alerts
6. ✅ Configure custom domain (optional)
7. ✅ Implement rate limiting (recommended)
8. ✅ Set up CI/CD for automatic deployments

---

**Need help?** Each platform has excellent documentation and community support. Start with Railway or Render.com if you're new to cloud deployment!
