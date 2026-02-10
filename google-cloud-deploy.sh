#!/bin/bash

# Build the frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Deploy Frontend to Firebase Hosting and Firestore
echo "Deploying to Firebase Hosting & Firestore..."
# Use npx to ensure we use the local or cached firebase-tools
npx firebase-tools deploy --only hosting,firestore

# Deploy Backend to Google Cloud Run
echo "Deploying Backend to Cloud Run..."
gcloud run deploy areyousafe-engine \
  --source engine \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

echo "Deployment complete!"
