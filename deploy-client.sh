#!/bin/bash

# ===========================================
# AI Companion Studio - Client Deployment Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLIENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/client" && pwd)"

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
    cd "$CLIENT_DIR"
    npm install
    log_success "Dependencies installed"
}

# Verify environment
verify_env() {
    log_info "Checking for .env file..."
    cd "$CLIENT_DIR"
    
    if [ ! -f ".env.production" ] && [ ! -f ".env" ]; then
        log_warn "No .env file found"
        log_info "Create .env.production with:"
        echo ""
        echo "  VITE_API_URL=https://your-backend-url.com"
        echo ""
        return 1
    fi
    
    log_success "Environment configuration found"
}

# Build client
build_client() {
    log_info "Building React application..."
    cd "$CLIENT_DIR"
    
    npm run build
    
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        log_success "Build completed (size: $DIST_SIZE)"
        log_info "Output directory: dist/"
    else
        log_error "Build failed - dist directory not created"
        exit 1
    fi
}

# Deploy to Vercel
deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not found"
        log_info "Install: npm install -g vercel"
        exit 1
    fi
    
    cd "$CLIENT_DIR"
    vercel --prod
    
    log_success "Deployed to Vercel"
}

# Deploy to Netlify
deploy_netlify() {
    log_info "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        log_error "Netlify CLI not found"
        log_info "Install: npm install -g netlify-cli"
        exit 1
    fi
    
    cd "$CLIENT_DIR"
    netlify deploy --prod --dir=dist
    
    log_success "Deployed to Netlify"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    log_info "Deploying to GitHub Pages..."
    
    # Requires gh CLI
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI not found"
        log_info "Install: https://cli.github.com/"
        exit 1
    fi
    
    cd "$CLIENT_DIR"
    
    # Build static site
    npm run build
    
    log_info "Upload dist/ directory to GitHub Pages manually or via:"
    echo "  gh pages deploy dist/"
    
    log_success "Build ready for GitHub Pages"
}

# Deploy to static hosting (manual)
deploy_static() {
    log_info "Static site build prepared"
    log_info "Deploy the dist/ folder to your static hosting:"
    echo ""
    echo "  Supported platforms:"
    echo "  - AWS S3 + CloudFront"
    echo "  - Google Cloud Storage"
    echo "  - Azure Static Web Apps"
    echo "  - Cloudflare Pages"
    echo "  - Any static file hosting"
    echo ""
    echo "  Steps:"
    echo "  1. Build: npm run build"
    echo "  2. Upload contents of dist/ to your hosting"
    echo "  3. Configure your backend URL in environment"
    echo "  4. Set up CNAME/domain DNS"
    echo ""
}

# Main
main() {
    local platform=$1
    
    log_info "================================================"
    log_info "Client Deployment Script"
    log_info "================================================"
    
    # Checks
    check_node
    install_deps
    verify_env || true
    build_client
    
    # Deploy based on platform
    case $platform in
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        github)
            deploy_github_pages
            ;;
        static)
            deploy_static
            ;;
        *)
            log_info "No deployment platform specified"
            log_success "Client build ready!"
            log_info "Use with: $0 [vercel|netlify|github|static]"
            ;;
    esac
    
    log_info "================================================"
    log_success "Client deployment preparation completed!"
    log_info "================================================"
}

# Usage
usage() {
    cat << EOF
Usage: $0 [PLATFORM]

PLATFORMS:
    vercel      Deploy to Vercel
    netlify     Deploy to Netlify
    github      Deploy to GitHub Pages
    static      Prepare for manual deployment
    (none)      Build only

EXAMPLES:
    $0 vercel
    $0 netlify
    $0 github

ENVIRONMENT:
    Create .env.production with:
    VITE_API_URL=https://your-backend-url.com

EOF
}

# Handle arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

main "$1"
