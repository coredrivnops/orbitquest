---
description: Complete guide for setting up a new project with GitHub integration and Google Cloud Run deployment
---

# Cloud Run + GitHub Deployment Setup Guide

This guide documents the complete process for deploying a web application to Google Cloud Run with GitHub CI/CD integration, based on lessons learned from HearthIQ, SubFree, and PuzzlyNest deployments.

---

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **GitHub Repository** for the project
3. **Verified Domain** in Google Search Console (for custom domains)
4. **gcloud CLI** installed and authenticated

---

## Phase 1: Project Structure

### Required Files

```
project-root/
├── Dockerfile           # Container build instructions
├── cloudbuild.yaml      # Cloud Build configuration
├── .gcloudignore        # Files to exclude from upload
├── package.json         # (for Node.js projects)
└── src/                 # Application source code
```

### Sample Dockerfile (Next.js)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
```

---

## Phase 2: Cloud Build Configuration

### cloudbuild.yaml Template (Free Tier Optimized)

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/SERVICE_NAME:latest', '.']

  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/SERVICE_NAME:latest']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'SERVICE_NAME'
      - '--image'
      - 'gcr.io/$PROJECT_ID/SERVICE_NAME:latest'
      - '--region'
      - 'us-central1'           # IMPORTANT: Always use us-central1 for Free Tier
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--min-instances'
      - '0'                      # Scale to zero when idle
      - '--max-instances'
      - '3'                      # Limit max instances
      - '--memory'
      - '256Mi'                  # Minimum memory for cost savings
      - '--cpu'
      - '0.5'                    # Half CPU (requires concurrency=1)
      - '--concurrency'
      - '1'                      # CRITICAL: Must be 1 when CPU < 1
      - '--port'
      - '8080'

images:
  - 'gcr.io/$PROJECT_ID/SERVICE_NAME:latest'

options:
  logging: CLOUD_LOGGING_ONLY
```

### ⚠️ Critical Configuration Rules

| Setting | Free Tier Value | Notes |
|---------|-----------------|-------|
| Region | `us-central1` | Only region with Free Tier |
| CPU | `0.5` or `1.0` | If < 1, concurrency must be 1 |
| Concurrency | `1` | Required when CPU < 1 |
| Memory | `256Mi` | Minimum viable |
| Min Instances | `0` | Scale to zero |
| Max Instances | `3` | Prevent runaway costs |

---

## Phase 3: GitHub Integration

### Option A: Cloud Build Trigger (Recommended)

1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click **"Connect Repository"** → Select GitHub
3. Authorize and select your repository
4. Create trigger:
   - **Event:** Push to branch
   - **Branch:** `^main$`
   - **Configuration:** Cloud Build configuration file
   - **Location:** `/cloudbuild.yaml`

### Option B: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: SERVICE_NAME
          region: us-central1
          source: .
```

---

## Phase 4: Custom Domain Setup

### Step 1: Add Domain Mapping

```powershell
gcloud beta run domain-mappings create --service=SERVICE_NAME --domain=yourdomain.com --region=us-central1 --project=PROJECT_ID
```

### Step 2: Get DNS Records

```powershell
gcloud beta run domain-mappings describe --domain=yourdomain.com --region=us-central1 --project=PROJECT_ID --format=yaml
```

### Step 3: Update DNS at Registrar

Add the following records at your DNS provider:

| Type | Host | Value |
|------|------|-------|
| A | @ | 216.239.32.21 |
| A | @ | 216.239.34.21 |
| A | @ | 216.239.36.21 |
| A | @ | 216.239.38.21 |
| AAAA | @ | 2001:4860:4802:32::15 |
| AAAA | @ | 2001:4860:4802:34::15 |
| AAAA | @ | 2001:4860:4802:36::15 |
| AAAA | @ | 2001:4860:4802:38::15 |
| CNAME | www | ghs.googlehosted.com. |

### Step 4: Wait for SSL Provisioning

SSL certificates are automatically provisioned (5-15 minutes after DNS propagates).

---

## Phase 5: Deployment Commands

### Manual Deployment (Bypasses GitHub)

```powershell
# Navigate to project directory
cd C:\Users\shrav\Documents\project-name

# Deploy directly
gcloud builds submit --config=cloudbuild.yaml . --project=PROJECT_ID --async
```

### Check Build Status

```powershell
# List ongoing builds
gcloud builds list --ongoing --project=PROJECT_ID

# List recent builds
gcloud builds list --limit=5 --project=PROJECT_ID
```

### Verify Deployment

```powershell
# List all services
gcloud run services list --project=PROJECT_ID

# Describe specific service
gcloud run services describe SERVICE_NAME --region=us-central1 --project=PROJECT_ID
```

---

## Phase 6: Region Migration (If Needed)

If you accidentally deployed to the wrong region:

### Step 1: Deploy to Correct Region
Update `cloudbuild.yaml` with correct region, then:
```powershell
gcloud builds submit --config=cloudbuild.yaml . --project=PROJECT_ID
```

### Step 2: Migrate Domain Mappings

```powershell
# Delete old mapping
gcloud beta run domain-mappings delete --domain=yourdomain.com --region=OLD_REGION --project=PROJECT_ID

# Create new mapping
gcloud beta run domain-mappings create --service=SERVICE_NAME --domain=yourdomain.com --region=us-central1 --project=PROJECT_ID
```

### Step 3: Update DNS (if IPs changed)

### Step 4: Delete Old Service

```powershell
gcloud run services delete SERVICE_NAME --region=OLD_REGION --project=PROJECT_ID
```

---

## Troubleshooting

### Error: "Total cpu < 1 is not supported with concurrency > 1"
**Fix:** Set `--concurrency 1` when using `--cpu 0.5`

### Error: "Certificate provisioning pending"
**Fix:** Verify DNS records are correctly set and wait 5-15 minutes

### Error: "Service not found in region"
**Fix:** Check `--region` flag matches where service was deployed

### Domain not loading after mapping
**Fix:** 
1. Verify DNS records with `nslookup yourdomain.com`
2. Wait for SSL provisioning (check Cloud Console)
3. Ensure service is healthy: `gcloud run services describe SERVICE_NAME`

---

## Cost Optimization Checklist

- [ ] Region set to `us-central1` (Free Tier)
- [ ] Min instances = 0 (Scale to zero)
- [ ] Max instances ≤ 3 (Prevent runaway)
- [ ] Memory = 256Mi (Minimum viable)
- [ ] CPU = 0.5 with Concurrency = 1
- [ ] Logging set to CLOUD_LOGGING_ONLY
- [ ] No always-on instances

---

## Quick Reference: CLI Commands

```powershell
# Project ID
$PROJECT = "gen-lang-client-0667918696"

# List services
gcloud run services list --project=$PROJECT

# List domain mappings
gcloud beta run domain-mappings list --region=us-central1 --project=$PROJECT

# Check builds
gcloud builds list --limit=5 --project=$PROJECT

# Deploy manually
gcloud builds submit --config=cloudbuild.yaml . --project=$PROJECT --async

# Delete service
gcloud run services delete SERVICE_NAME --region=REGION --project=$PROJECT
```

---

## Files Updated: 2026-01-05

Based on lessons learned from:
- HearthIQ (gethearthiq.com)
- SubFree (subfree.io)
- PuzzlyNest (puzzlynest.com)
