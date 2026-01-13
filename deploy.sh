#!/bin/bash

# OrbitQuest - Quick Deploy Script
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying OrbitQuest to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project: $PROJECT_ID"
echo "🌍 Region: us-central1"

# Submit build
echo "🔨 Submitting Cloud Build..."
gcloud builds submit --config cloudbuild.yaml

echo "✅ Deployment complete!"
echo "🌐 View at: https://orbitquest-${PROJECT_ID}.run.app"
