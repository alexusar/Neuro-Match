#!/bin/bash
set -e

echo "🚀 Deploying backend to neuro-match.com..."

ssh aidendev@neuro-match.com << 'EOF'
  set -e
  echo "📥 Pulling latest code..."
  cd /home/aidendev/Neuro-Match/backend
  git pull origin main

  echo "📦 Installing dependencies..."
  npm install

  echo "🛠️ Compiling TypeScript..."
  npm run build

  echo "🔁 Restarting backend with PM2..."
  pm2 restart index || pm2 start dist/index.js --name index

  echo "✅ Backend deployed successfully on server!"
EOF
