#!/bin/bash

# ===========================================
# AI Companion Studio - Environment Setup Script
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Setup server .env
setup_server_env() {
    log_info "Setting up server environment variables..."
    cd "$SERVER_DIR"
    
    if [ -f ".env" ]; then
        log_warn ".env already exists. Skipping creation."
        return 0
    fi
    
    if [ ! -f ".env.example" ]; then
        log_error ".env.example not found"
        exit 1
    fi
    
    # Copy example to .env
    cp .env.example .env
    log_success "Created server/.env from .env.example"
    
    log_info "Now edit server/.env and set:"
    echo ""
    echo "  Required variables:"
    echo "    - DATABASE_URL=postgresql://..."
    echo "    - JWT_SECRET=your-secret (min 32 chars)"
    echo "    - JWT_REFRESH_SECRET=your-secret (min 32 chars)"
    echo "    - OPENROUTER_API_KEY=sk-or-v1-..."
    echo "    - APP_URL=http://localhost:5173"
    echo ""
    echo "  Get OpenRouter API key from:"
    echo "    https://openrouter.ai/keys"
    echo ""
    echo "  Generate secrets with:"
    echo "    openssl rand -base64 32"
    echo ""
}

# Setup client .env
setup_client_env() {
    log_info "Setting up client environment variables..."
    cd "$CLIENT_DIR"
    
    if [ -f ".env.production" ]; then
        log_warn ".env.production already exists. Skipping creation."
    else
        cat > .env.production << EOF
# Backend API URL
VITE_API_URL=http://localhost:3000
EOF
        log_success "Created client/.env.production"
    fi
    
    if [ ! -f ".env.development" ]; then
        cat > .env.development << EOF
# Backend API URL (development)
VITE_API_URL=http://localhost:3000
EOF
        log_success "Created client/.env.development"
    fi
}

# Verify .env files
verify_env() {
    log_info "Verifying environment setup..."
    
    cd "$SERVER_DIR"
    
    if [ ! -f ".env" ]; then
        log_error "server/.env not found"
        return 1
    fi
    
    # Check required variables
    REQUIRED_VARS=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "OPENROUTER_API_KEY"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            VALUE=$(grep "^$var=" .env | cut -d'=' -f2)
            if [ -z "$VALUE" ] || [ "$VALUE" = "your-" ]; then
                log_warn "$var is not configured"
            else
                log_success "$var is configured"
            fi
        else
            log_warn "$var not found in .env"
        fi
    done
    
    log_success "Environment verification completed"
}

# Generate secrets
generate_secrets() {
    log_info "Generating secure secrets..."
    
    if ! command -v openssl &> /dev/null; then
        log_error "openssl not found. Install openssl to generate secrets."
        return 1
    fi
    
    log_info "Generating JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo ""
    echo "JWT_SECRET=$JWT_SECRET"
    echo ""
    
    log_info "Generating JWT_REFRESH_SECRET..."
    JWT_REFRESH=$(openssl rand -base64 32)
    echo ""
    echo "JWT_REFRESH_SECRET=$JWT_REFRESH"
    echo ""
    
    log_info "Copy these values to your server/.env file"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if .env.example exists
    if [ ! -f "$SERVER_DIR/.env.example" ]; then
        log_error "server/.env.example not found"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Main menu
show_menu() {
    echo ""
    echo "================================================"
    echo "Environment Setup Menu"
    echo "================================================"
    echo ""
    echo "1. Setup server .env file"
    echo "2. Setup client .env file"
    echo "3. Setup both (recommended)"
    echo "4. Verify .env files"
    echo "5. Generate secure secrets"
    echo "6. View .env example"
    echo "0. Exit"
    echo ""
    echo "================================================"
}

# View .env example
view_env_example() {
    echo ""
    log_info "Viewing server/.env.example..."
    echo ""
    head -50 "$SERVER_DIR/.env.example"
    echo ""
    echo "... (see server/.env.example for full content)"
}

# Main function
main() {
    log_info "================================================"
    log_info "Environment Configuration Setup"
    log_info "================================================"
    
    check_prerequisites
    
    # If argument provided, run that option
    if [ -z "$1" ]; then
        # Interactive mode
        while true; do
            show_menu
            read -p "Select option (0-6): " choice
            
            case $choice in
                1)
                    setup_server_env
                    ;;
                2)
                    setup_client_env
                    ;;
                3)
                    setup_server_env
                    setup_client_env
                    verify_env
                    ;;
                4)
                    verify_env
                    ;;
                5)
                    generate_secrets
                    ;;
                6)
                    view_env_example
                    ;;
                0)
                    log_info "Exiting..."
                    exit 0
                    ;;
                *)
                    log_error "Invalid option"
                    ;;
            esac
        done
    else
        # Batch mode
        case $1 in
            server)
                setup_server_env
                ;;
            client)
                setup_client_env
                ;;
            both)
                setup_server_env
                setup_client_env
                verify_env
                ;;
            verify)
                verify_env
                ;;
            generate)
                generate_secrets
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    fi
}

# Usage
usage() {
    cat << EOF
Usage: $0 [OPTION]

OPTIONS:
    server      Setup server .env only
    client      Setup client .env only
    both        Setup both .env files (recommended)
    verify      Verify .env configuration
    generate    Generate secure secrets
    (none)      Interactive menu

EXAMPLES:
    $0                  # Show interactive menu
    $0 both             # Setup both .env files
    $0 generate         # Generate secrets
    $0 verify           # Verify configuration

EOF
}

# Handle arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

main "$1"
