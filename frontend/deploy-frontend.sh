#!/bin/bash
set -e

echo "🚀 Deploying frontend..."

# Navigate to the frontend directory (optional if you're already there)
cd /home/ubuntu/neuro-match/frontend

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building frontend with Vite..."
npm run build

echo "🚚 Moving build to Nginx directory (/var/www/html)..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

echo "✅ Frontend deployed successfully!"
