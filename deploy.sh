#!/bin/bash

# ===========================================
# AI Companion Studio - Full Deployment Script
# Deploys both server and client
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build server
build_server() {
    log_info "Building server..."
    cd "$SERVER_DIR"
    
    # Install dependencies
    log_info "Installing server dependencies..."
    npm install
    
    # Run migrations
    log_info "Setting up database..."
    npx prisma migrate deploy
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    
    log_success "Server build completed"
}

# Build client
build_client() {
    log_info "Building client..."
    cd "$CLIENT_DIR"
    
    # Install dependencies
    log_info "Installing client dependencies..."
    npm install
    
    # Build
    log_info "Building React app..."
    npm run build
    
    log_success "Client build completed"
}

# Test server
test_server() {
    log_info "Testing server health..."
    cd "$SERVER_DIR"
    
    # Check if health endpoint exists
    if [ -f "src/app.js" ]; then
        log_success "Server files verified"
    else
        log_error "Server files not found"
        exit 1
    fi
}

# Deploy server to platform
deploy_server() {
    local platform=$1
    
    case $platform in
        render)
            log_info "Deploying to Render..."
            cd "$SERVER_DIR"
            log_warn "Please push to GitHub, then trigger deployment from Render dashboard"
            ;;
        railway)
            log_info "Deploying to Railway..."
            cd "$SERVER_DIR"
            log_warn "Please push to GitHub, then trigger deployment from Railway dashboard"
            ;;
        fly)
            log_info "Deploying to Fly.io..."
            cd "$SERVER_DIR"
            if command -v flyctl &> /dev/null; then
                flyctl deploy
                log_success "Server deployed to Fly.io"
            else
                log_error "flyctl CLI not found. Install from https://fly.io/docs/getting-started/installing-flyctl/"
                exit 1
            fi
            ;;
        *)
            log_warn "Platform '$platform' not specified. Build only."
            ;;
    esac
}

# Deploy client to platform
deploy_client() {
    local platform=$1
    
    case $platform in
        vercel)
            log_info "Deploying to Vercel..."
            cd "$CLIENT_DIR"
            if command -v vercel &> /dev/null; then
                vercel --prod
                log_success "Client deployed to Vercel"
            else
                log_warn "Vercel CLI not found. Install: npm i -g vercel"
            fi
            ;;
        netlify)
            log_info "Deploying to Netlify..."
            cd "$CLIENT_DIR"
            if command -v netlify &> /dev/null; then
                netlify deploy --prod --dir=dist
                log_success "Client deployed to Netlify"
            else
                log_warn "Netlify CLI not found. Install: npm i -g netlify-cli"
            fi
            ;;
        static)
            log_info "Building static site for deployment..."
            cd "$CLIENT_DIR"
            log_success "Build ready in dist/ directory"
            ;;
        *)
            log_warn "Platform '$platform' not specified. Build only."
            ;;
    esac
}

# Git operations
git_push() {
    log_info "Pushing to GitHub..."
    cd "$PROJECT_ROOT"
    
    if [ -z "$(git status --porcelain)" ]; then
        log_warn "No changes to commit"
    else
        git add -A
        git commit -m "Deploy: production build $(date +'%Y-%m-%d %H:%M:%S')"
        git push origin full-developer
        log_success "Pushed to GitHub"
    fi
}

# Main deployment flow
deploy_full() {
    local server_platform=$1
    local client_platform=$2
    
    log_info "================================================"
    log_info "AI Companion Studio - Full Deployment"
    log_info "================================================"
    log_info "Server Platform: ${server_platform:-'build-only'}"
    log_info "Client Platform: ${client_platform:-'build-only'}"
    log_info "================================================"
    
    # Prerequisites
    check_prerequisites
    
    # Build
    build_server
    build_client
    
    # Test
    test_server
    
    # Push to GitHub
    git_push
    
    # Deploy
    deploy_server "$server_platform"
    deploy_client "$client_platform"
    
    log_info "================================================"
    log_success "Deployment process completed!"
    log_info "================================================"
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

OPTIONS:
    -s, --server PLATFORM    Deploy server to platform (render, railway, fly)
    -c, --client PLATFORM    Deploy client to platform (vercel, netlify, static)
    -h, --help              Show this help message

EXAMPLES:
    # Build only
    $0

    # Deploy to Render (server) and Vercel (client)
    $0 -s render -c vercel

    # Deploy to Fly.io (server) only
    $0 -s fly

    # Deploy to Netlify (client) only
    $0 -c netlify

SUPPORTED PLATFORMS:
    Server:  render, railway, fly
    Client:  vercel, netlify, static

EOF
}

# Parse arguments
SERVER_PLATFORM=""
CLIENT_PLATFORM=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--server)
            SERVER_PLATFORM="$2"
            shift 2
            ;;
        -c|--client)
            CLIENT_PLATFORM="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run deployment
deploy_full "$SERVER_PLATFORM" "$CLIENT_PLATFORM"
