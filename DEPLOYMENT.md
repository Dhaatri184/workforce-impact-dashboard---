# Deployment Guide

This guide covers deploying the Workforce Impact Dashboard to various environments.

## 🚀 Quick Start

### Docker Deployment (Recommended)

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Production: http://localhost:3000
   - Development: http://localhost:5173

### Manual Build and Deploy

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Serve the built files:**
   ```bash
   npm run preview
   ```

## 🏗️ Build Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `VITE_GITHUB_TOKEN`: GitHub API token for AI repository data
- `VITE_API_BASE_URL`: Base URL for external APIs
- `VITE_ENABLE_DEMO_MODE`: Enable/disable demo mode

### Build Optimization

The build is optimized for production with:
- Code splitting for vendor libraries
- Terser minification
- Tree shaking
- Asset optimization
- Source maps (disabled in production)

## 🐳 Docker Deployment

### Single Container

```bash
# Build the image
docker build -t workforce-dashboard .

# Run the container
docker run -p 3000:80 workforce-dashboard
```

### Multi-Container with Docker Compose

```bash
# Production deployment
docker-compose up -d

# Development with hot reload
docker-compose --profile dev up -d
```

### Multi-Platform Build

```bash
# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t workforce-dashboard .
```

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.19+)
- kubectl configured
- Ingress controller (nginx recommended)
- cert-manager (for SSL certificates)

### Deploy to Kubernetes

1. **Create namespace:**
   ```bash
   kubectl create namespace workforce-dashboard
   ```

2. **Apply configurations:**
   ```bash
   kubectl apply -f k8s/ -n workforce-dashboard
   ```

3. **Verify deployment:**
   ```bash
   kubectl get pods -n workforce-dashboard
   kubectl get services -n workforce-dashboard
   ```

### Using Deployment Scripts

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production v1.0.0
```

## 🔄 CI/CD Pipeline

### GitHub Actions

The repository includes a complete CI/CD pipeline:

- **Continuous Integration:**
  - Linting and type checking
  - Unit and property-based tests
  - Security scanning
  - Build verification

- **Continuous Deployment:**
  - Docker image building
  - Multi-platform support
  - Automatic deployment to staging/production
  - Performance testing with Lighthouse

### Pipeline Configuration

1. **Set up secrets in GitHub:**
   - `GITHUB_TOKEN`: For package registry
   - `KUBECONFIG`: For Kubernetes deployment
   - `DOCKER_REGISTRY_TOKEN`: For Docker registry

2. **Configure environments:**
   - Create `staging` and `production` environments
   - Set up protection rules
   - Configure approval workflows

## 🌐 Cloud Platform Deployment

### Vercel (Recommended for Static Hosting)

1. **Connect repository to Vercel**
2. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set environment variables in Vercel dashboard**

### Netlify

1. **Connect repository to Netlify**
2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add environment variables**
4. **Configure redirects for SPA routing:**
   ```
   /*    /index.html   200
   ```

### AWS S3 + CloudFront

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront distribution**
4. **Set up custom domain and SSL**

### Google Cloud Platform

1. **Build and containerize:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/workforce-dashboard
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy --image gcr.io/PROJECT-ID/workforce-dashboard --platform managed
   ```

## 🔧 Configuration Management

### Environment-Specific Configs

- `.env.production`: Production settings
- `.env.staging`: Staging settings
- `.env.development`: Development settings

### Kubernetes ConfigMaps

```bash
# Update configuration
kubectl apply -f k8s/configmap.yml

# Restart deployment to pick up changes
kubectl rollout restart deployment/workforce-dashboard
```

### Docker Environment Variables

```bash
docker run -e VITE_API_BASE_URL=https://api.example.com workforce-dashboard
```

## 📊 Monitoring and Observability

### Health Checks

The application provides health check endpoints:
- `/health`: Basic health status
- Container health checks configured in Docker and Kubernetes

### Logging

- Application logs to stdout/stderr
- Nginx access logs
- Kubernetes pod logs accessible via kubectl

### Performance Monitoring

- Lighthouse CI for performance testing
- Core Web Vitals monitoring
- Bundle size analysis

## 🔒 Security Considerations

### Container Security

- Non-root user execution
- Read-only root filesystem
- Minimal base image (Alpine Linux)
- Security scanning with Trivy

### Network Security

- HTTPS enforcement
- Security headers configured
- CSP (Content Security Policy) headers
- CORS configuration

### Secrets Management

- Environment variables for sensitive data
- Kubernetes secrets for API keys
- No secrets in container images

## 🚨 Troubleshooting

### Common Issues

1. **Build failures:**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Container startup issues:**
   - Verify port configuration
   - Check health check endpoints
   - Review container logs

3. **Kubernetes deployment issues:**
   - Verify resource limits
   - Check ingress configuration
   - Validate service selectors

### Debug Commands

```bash
# Check container logs
docker logs workforce-dashboard

# Debug Kubernetes pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>

# Test health endpoints
curl http://localhost:3000/health
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale Kubernetes deployment
kubectl scale deployment workforce-dashboard --replicas=5

# Auto-scaling based on CPU
kubectl autoscale deployment workforce-dashboard --cpu-percent=70 --min=2 --max=10
```

### Performance Optimization

- Enable CDN for static assets
- Configure caching headers
- Use HTTP/2 and compression
- Optimize bundle size

## 🔄 Updates and Rollbacks

### Rolling Updates

```bash
# Update image tag
kubectl set image deployment/workforce-dashboard workforce-dashboard=new-image:tag

# Monitor rollout
kubectl rollout status deployment/workforce-dashboard
```

### Rollbacks

```bash
# Rollback to previous version
kubectl rollout undo deployment/workforce-dashboard

# Rollback to specific revision
kubectl rollout undo deployment/workforce-dashboard --to-revision=2
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify configuration settings
4. Contact the development team

---

**Note:** This deployment guide assumes familiarity with Docker, Kubernetes, and cloud platforms. Adjust configurations based on your specific infrastructure requirements.