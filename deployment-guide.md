# Amrikyy-AIOS Google Cloud Run Deployment Guide

This guide provides step-by-step instructions for deploying the Amrikyy-AIOS application to Google Cloud Run using either GitHub Actions or Cloud Build.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Google Cloud Project Setup](#google-cloud-project-setup)
- [Service Account Configuration](#service-account-configuration)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Deployment Methods](#deployment-methods)
  - [Method 1: GitHub Actions (Recommended)](#method-1-github-actions-recommended)
  - [Method 2: Cloud Build](#method-2-cloud-build)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- A Google Cloud Platform (GCP) account
- [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) installed locally
- A GitHub account with access to this repository
- Basic knowledge of Docker and cloud deployments

## Google Cloud Project Setup

### 1. Create a New GCP Project

```bash
# Set your project ID (choose a unique name)
export PROJECT_ID="amrikyy-aios-prod"

# Create the project
gcloud projects create $PROJECT_ID --name="Amrikyy AIOS Production"

# Set as default project
gcloud config set project $PROJECT_ID
```

### 2. Enable Billing

Visit the [Google Cloud Console](https://console.cloud.google.com/billing) and enable billing for your project.

### 3. Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API (optional, for Cloud Build deployment)
gcloud services enable cloudbuild.googleapis.com

# Enable Artifact Registry API (recommended for newer projects)
gcloud services enable artifactregistry.googleapis.com
```

## Service Account Configuration

### 1. Create a Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account" \
  --description="Service account for GitHub Actions deployments"
```

### 2. Grant Required Permissions

```bash
# Get your project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Grant Storage Admin role (for Container Registry)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Grant Service Account User role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 3. Create and Download Service Account Key

```bash
# Create JSON key
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com

# Display the key content (you'll need this for GitHub Secrets)
cat ~/gcp-key.json

# IMPORTANT: Keep this file secure and delete it after adding to GitHub Secrets
```

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GOOGLE_PROJECT_ID` | Your GCP Project ID | `amrikyy-aios-prod` |
| `GCP_SA_KEY` | Service account JSON key (base64 encoded is optional) | Contents of `gcp-key.json` |
| `VITE_API_KEY` | Your API key for the application | `your-api-key-here` |

### Optional Secrets

| Secret Name | Description |
|-------------|-------------|
| `API_KEY` | Alternative name for API key (fallback) |

**To add GCP_SA_KEY:**
```bash
# Option 1: Copy the entire JSON content directly (recommended)
cat ~/gcp-key.json

# Option 2: Base64 encode (if required by your workflow)
cat ~/gcp-key.json | base64
```

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

The GitHub Actions workflow is triggered automatically on every push to the `main` branch.

#### Automatic Deployment

1. Ensure all GitHub Secrets are configured (see above)
2. Push your code to the `main` branch:
   ```bash
   git add .
   git commit -m "Deploy to Cloud Run"
   git push origin main
   ```
3. Monitor the deployment in the **Actions** tab of your GitHub repository
4. Once complete, the workflow summary will display the deployed service URL

#### Manual Deployment

You can also trigger the workflow manually:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Google Cloud Run** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

### Method 2: Cloud Build

Cloud Build can be used as an alternative to GitHub Actions.

#### Setup Cloud Build Trigger

1. **Connect your repository to Cloud Build:**
   ```bash
   # This will open a browser to connect your GitHub repository
   gcloud beta builds triggers create github \
     --repo-name=Amrikyy-AIOS \
     --repo-owner=Moeabdelaziz007 \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml
   ```

2. **Set substitution variables in the trigger:**
   - Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
   - Edit your trigger
   - Add substitution variables:
     - `_VITE_API_KEY`: Your API key

#### Manual Build Execution

```bash
# Submit a build manually
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_VITE_API_KEY="your-api-key-here" \
  .
```

## Environment Variables

The application uses Vite, which requires environment variables to be prefixed with `VITE_`.

### Build-time Variables

These are set during the Docker build process:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_KEY` | API key for external services | Yes |
| `VITE_APP_NAME` | Application name | No (default: Amrikyy-AIOS) |
| `VITE_APP_VERSION` | Application version/commit SHA | No (auto-set) |

### Configuration in `.env.example`

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values.

## Custom Domain Setup

### 1. Map a Custom Domain

```bash
# Map your custom domain to the Cloud Run service
gcloud run domain-mappings create \
  --service=amrikyy-aios \
  --domain=your-domain.com \
  --region=us-central1
```

### 2. Update DNS Records

Follow the instructions provided by the `domain-mappings create` command to add DNS records to your domain registrar.

### 3. Verify Domain Mapping

```bash
# Check domain mapping status
gcloud run domain-mappings describe \
  --domain=your-domain.com \
  --region=us-central1
```

## Troubleshooting

### Common Issues

#### 1. Build Fails with "Permission Denied"

**Solution:** Ensure the service account has the correct IAM roles:
```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"
```

#### 2. Cloud Run Deployment Fails

**Check Cloud Run logs:**
```bash
gcloud run services logs read amrikyy-aios \
  --region=us-central1 \
  --limit=50
```

#### 3. Container Build Fails

**Check build logs:**
```bash
# For Cloud Build
gcloud builds list --limit=5

# Get specific build logs
gcloud builds log <BUILD_ID>
```

#### 4. Service Returns 503 Error

**Possible causes:**
- Container not listening on the correct port (should be 8080)
- Container startup timeout (increase with `--timeout` flag)
- Out of memory (increase with `--memory` flag)

**Check service details:**
```bash
gcloud run services describe amrikyy-aios \
  --region=us-central1 \
  --format=yaml
```

#### 5. Environment Variables Not Set

Ensure environment variables are set correctly:
```bash
gcloud run services describe amrikyy-aios \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### Useful Commands

#### View Service URL

```bash
gcloud run services describe amrikyy-aios \
  --region=us-central1 \
  --format='value(status.url)'
```

#### Update Service Configuration

```bash
# Update memory limit
gcloud run services update amrikyy-aios \
  --region=us-central1 \
  --memory=1Gi

# Update environment variable
gcloud run services update amrikyy-aios \
  --region=us-central1 \
  --set-env-vars="VITE_API_KEY=new-api-key"
```

#### Delete Service

```bash
gcloud run services delete amrikyy-aios \
  --region=us-central1
```

#### List All Services

```bash
gcloud run services list
```

### Local Testing

Test the Docker container locally before deploying:

```bash
# Build the image
docker build \
  --build-arg VITE_API_KEY="your-api-key-here" \
  -t amrikyy-aios:local \
  .

# Run the container
docker run -p 8080:8080 amrikyy-aios:local

# Access at http://localhost:8080
```

### Performance Optimization

#### 1. Adjust Instance Settings

```bash
gcloud run services update amrikyy-aios \
  --region=us-central1 \
  --min-instances=1 \
  --max-instances=100 \
  --concurrency=80
```

#### 2. Enable CPU Throttling (Cost Optimization)

```bash
gcloud run services update amrikyy-aios \
  --region=us-central1 \
  --cpu-throttling
```

#### 3. Configure Request Timeout

```bash
gcloud run services update amrikyy-aios \
  --region=us-central1 \
  --timeout=60
```

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Container Registry Documentation](https://cloud.google.com/container-registry/docs)
- [GitHub Actions for GCP](https://github.com/google-github-actions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Cloud Run logs
3. Open an issue in the GitHub repository
