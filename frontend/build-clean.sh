# Pre-build script to ensure clean dependency resolution
echo "🧹 Cleaning dependency artifacts..."

# Remove lock files and node_modules for clean install
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

echo "📦 Starting fresh install..."
npm install

echo "🏗️ Building project..."
npm run build
