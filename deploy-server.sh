#!/bin/bash

# ===========================================
# AI Companion Studio - Server Deployment Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/server" && pwd)"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️ [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠️ [WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1"
}

# Check Node.js
check_node() {
    log_info "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    log_success "Node.js $NODE_VERSION found"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    cd "$SERVER_DIR"
    npm install
    log_success "Dependencies installed"
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    cd "$SERVER_DIR"
    
    if [ -z "$DATABASE_URL" ]; then
        log_warn "DATABASE_URL not set. Skipping database setup."
        log_info "Set DATABASE_URL environment variable to enable migration"
        return 0
    fi
    
    log_info "Running Prisma migrations..."
    npx prisma migrate deploy
    
    log_info "Generating Prisma client..."
    npx prisma generate
    
    log_success "Database setup completed"
}

# Verify environment
verify_env() {
    log_info "Verifying environment variables..."
    cd "$SERVER_DIR"
    
    REQUIRED_VARS=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "OPENROUTER_API_KEY"
    )
    
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        log_warn "Missing environment variables: ${MISSING_VARS[*]}"
        log_info "Create .env file with required variables"
        log_info "Use .env.example as template"
        return 1
    fi
    
    log_success "All required environment variables are set"
}

# Test server
test_server() {
    log_info "Testing server startup..."
    cd "$SERVER_DIR"
    
    # Check if main files exist
    if [ ! -f "src/index.js" ] || [ ! -f "src/app.js" ]; then
        log_error "Server files not found"
        exit 1
    fi
    
    log_success "Server files verified"
}

# Build for production
build_prod() {
    log_info "Preparing for production..."
    cd "$SERVER_DIR"
    
    # Ensure Prisma client is generated
    npx prisma generate
    
    # Verify package.json has correct start script
    if grep -q '"start": "node src/index.js"' package.json; then
        log_success "Production start script verified"
    else
        log_error "Invalid start script in package.json"
        exit 1
    fi
}

# Deploy to Render
deploy_render() {
    log_info "Preparing for Render deployment..."
    log_info "Steps to deploy to Render:"
    echo ""
    echo "  1. Push code to GitHub:"
    echo "     git push origin full-developer"
    echo ""
    echo "  2. Go to https://render.com"
    echo "  3. Create new Web Service"
    echo "  4. Connect GitHub repository"
    echo "  5. Configure:"
    echo "     - Build Command: cd server && npm install"
    echo "     - Start Command: npm start"
    echo "  6. Add environment variables"
    echo "  7. Click Deploy"
    echo ""
}

# Deploy to Railway
deploy_railway() {
    log_info "Preparing for Railway deployment..."
    log_info "Steps to deploy to Railway:"
    echo ""
    echo "  1. Push code to GitHub:"
    echo "     git push origin full-developer"
    echo ""
    echo "  2. Go to https://railway.app"
    echo "  3. Create new project"
    echo "  4. Import from GitHub"
    echo "  5. Select aiCompanionStudio repository"
    echo "  6. Add PostgreSQL database"
    echo "  7. Set environment variables"
    echo "  8. Deploy"
    echo ""
}

# Deploy to Fly.io
deploy_fly() {
    log_info "Preparing for Fly.io deployment..."
    
    if ! command -v flyctl &> /dev/null; then
        log_error "flyctl not found. Install from: https://fly.io/docs/getting-started/installing-flyctl/"
        exit 1
    fi
    
    cd "$SERVER_DIR"
    
    if [ ! -f "fly.toml" ]; then
        log_info "Creating fly.toml configuration..."
        flyctl launch --no-deploy
    fi
    
    log_info "Deploying to Fly.io..."
    flyctl deploy
    
    log_success "Deployed to Fly.io"
    flyctl open
}

# Main
main() {
    local platform=$1
    
    log_info "================================================"
    log_info "Server Deployment Script"
    log_info "================================================"
    
    # Checks
    check_node
    install_deps
    verify_env || true
    test_server
    setup_database
    build_prod
    
    # Deploy based on platform
    case $platform in
        render)
            deploy_render
            ;;
        railway)
            deploy_railway
            ;;
        fly|flyio)
            deploy_fly
            ;;
        *)
            log_info "No deployment platform specified"
            log_success "Server is ready to deploy!"
            log_info "Use with: $0 [render|railway|fly]"
            ;;
    esac
    
    log_info "================================================"
    log_success "Server deployment preparation completed!"
    log_info "================================================"
}

# Usage
usage() {
    cat << EOF
Usage: $0 [PLATFORM]

PLATFORMS:
    render      Deploy to Render
    railway     Deploy to Railway
    fly         Deploy to Fly.io
    (none)      Prepare for manual deployment

EXAMPLES:
    $0 render
    $0 railway
    $0 fly

EOF
}

# Handle arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

main "$1"
