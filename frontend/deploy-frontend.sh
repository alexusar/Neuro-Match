#!/bin/bash
set -e

echo "🚀 Deploying frontend to neuro-match.com..."

ssh aidendev@neuro-match.com << 'EOF'
  set -e
  echo "📥 Pulling latest code..."
  cd /home/aidendev/Neuro-Match/frontend
  git pull origin main

  echo "📦 Installing dependencies..."
  npm install

  echo "🏗️ Building frontend with Vite..."
  npm run build

  echo "🚚 Moving build to Nginx directory (/var/www/html)..."
  sudo rm -rf /var/www/neuro-match/dist/*
  sudo cp -r dist/* /var/www/neuro-match/dist/

  echo "✅ Frontend deployed successfully!"
EOF
