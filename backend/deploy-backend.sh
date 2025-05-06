#!/bin/bash
set -e

echo "🚀 Deploying backend..."

# Navigate to the backend folder (adjust this if needed)
cd /home/ubuntu/neuro-match/backend

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🛠️ Compiling TypeScript..."
npm run build

echo "🔁 Restarting backend with PM2..."
pm2 restart index || pm2 start dist/index.js --name index

echo "✅ Backend deployed successfully!"
