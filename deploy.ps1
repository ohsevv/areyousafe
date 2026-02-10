param (
  [string]$ProjectId = "areyousafe-prod"
)

# Check for gcloud
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
  Write-Error "Error: 'gcloud' is not found in your PATH."
  Write-Warning "If you just installed Google Cloud SDK, you MUST restart your terminal (or VS Code) for the changes to take effect."
  Write-Warning "Please close this terminal, open a new one, and try again."
  exit 1
}

# Build the frontend
Write-Host "Building frontend..."
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
Set-Location ..

# Deploy Frontend to Firebase Hosting
Write-Host "Deploying to Firebase Hosting ($ProjectId)..."
# Use npx to ensure we use the local or cached firebase-tools
# Explicitly set the project to avoid "No currently active project" error
npx firebase-tools deploy --only hosting --project $ProjectId

# Deploy Backend to Google Cloud Run
Write-Host "Deploying Backend to Cloud Run ($ProjectId)..."
gcloud run deploy areyousafe-engine `
  --source engine `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --project $ProjectId

Write-Host "Deployment complete!"
