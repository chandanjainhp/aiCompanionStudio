#!/bin/bash

# AI Companion Studio - Complete Startup Script with tmux
# This script manages PostgreSQL, Backend Server, and optionally Client dev server

set -e

echo "======================================"
echo "AI Companion Studio - Startup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Define paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"
NGINX_DEPLOY_PATH="/var/www/aicompanion"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check and start PostgreSQL
print_status "Checking PostgreSQL status..."
if sudo systemctl is-active --quiet postgresql; then
    print_status "PostgreSQL is already running"
else
    print_warning "PostgreSQL is not running, starting it..."
    sudo systemctl start postgresql
    if [ $? -eq 0 ]; then
        print_status "PostgreSQL started successfully"
        sleep 2
    else
        print_error "Failed to start PostgreSQL"
        exit 1
    fi
fi

# Verify PostgreSQL is accessible
print_status "Verifying PostgreSQL connection..."
if sudo -u postgres psql -c "SELECT 1" > /dev/null 2>&1; then
    print_status "PostgreSQL connection verified"
else
    print_error "Cannot connect to PostgreSQL"
    exit 1
fi

# Check if tmux session already exists
TMUX_SESSION="aicompanion"
if tmux has-session -t $TMUX_SESSION 2>/dev/null; then
    print_warning "Tmux session '$TMUX_SESSION' already exists"
    echo "Options:"
    echo "  1) Kill existing session and create new one"
    echo "  2) Attach to existing session"
    echo "  3) Exit"
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            print_status "Killing existing session..."
            tmux kill-session -t $TMUX_SESSION
            ;;
        2)
            print_status "Attaching to existing session..."
            tmux attach -t $TMUX_SESSION
            exit 0
            ;;
        3)
            exit 0
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
fi

# Deploy client build to nginx
print_status "Checking if client build exists..."
if [ ! -d "$CLIENT_DIR/dist" ]; then
    print_error "Client build not found at $CLIENT_DIR/dist"
    print_warning "Please run 'npm run build' in the client directory first"
    exit 1
fi

print_status "Deploying client to nginx at $NGINX_DEPLOY_PATH..."
if [ ! -d "$NGINX_DEPLOY_PATH" ]; then
    print_warning "Nginx deploy path does not exist, creating it..."
    sudo mkdir -p "$NGINX_DEPLOY_PATH"
fi

sudo cp -r "$CLIENT_DIR/dist/"* "$NGINX_DEPLOY_PATH/"
sudo chown -R www-data:www-data "$NGINX_DEPLOY_PATH"
sudo chmod -R 755 "$NGINX_DEPLOY_PATH"
print_status "Client deployed to nginx"

# Test and reload nginx
print_status "Testing nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
    sudo systemctl reload nginx
    print_status "Nginx reloaded successfully"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Create new tmux session with server
print_status "Creating tmux session '$TMUX_SESSION'..."
tmux new-session -d -s $TMUX_SESSION -n "server"

# Run server in first pane
print_status "Starting backend server in tmux pane 1..."
tmux send-keys -t $TMUX_SESSION:0.0 "cd $SERVER_DIR" C-m
tmux send-keys -t $TMUX_SESSION:0.0 "echo '===== Backend Server ====='" C-m
tmux send-keys -t $TMUX_SESSION:0.0 "npm start" C-m

# Create second pane for client (optional - for dev server)
print_status "Creating pane for client dev server (optional)..."
tmux split-window -h -t $TMUX_SESSION:0
tmux send-keys -t $TMUX_SESSION:0.1 "cd $CLIENT_DIR" C-m
tmux send-keys -t $TMUX_SESSION:0.1 "echo '===== Client Dev Server (Optional) ====='" C-m
tmux send-keys -t $TMUX_SESSION:0.1 "echo 'Client is already deployed to nginx'" C-m
tmux send-keys -t $TMUX_SESSION:0.1 "echo 'To run dev server: npm run dev'" C-m
tmux send-keys -t $TMUX_SESSION:0.1 "echo 'Press Enter to start dev server, or Ctrl+C to skip'" C-m

# Display final status
echo ""
echo "======================================"
print_status "Setup Complete!"
echo "======================================"
echo ""
echo "Services Status:"
echo "  ✅ PostgreSQL: Running"
echo "  ✅ Nginx: Running (serving client at http://140.245.224.167)"
echo "  ✅ Backend Server: Starting in tmux"
echo ""
echo "Tmux Session: $TMUX_SESSION"
echo ""
echo "Useful Commands:"
echo "  Attach to session:  tmux attach -t $TMUX_SESSION"
echo "  Detach from tmux:   Ctrl+B, then D"
echo "  Switch panes:       Ctrl+B, then arrow keys"
echo "  Kill session:       tmux kill-session -t $TMUX_SESSION"
echo ""
echo "Access your application at: http://140.245.224.167"
echo ""

# Ask if user wants to attach
read -p "Attach to tmux session now? (y/n): " attach_choice
if [ "$attach_choice" = "y" ] || [ "$attach_choice" = "Y" ]; then
    tmux attach -t $TMUX_SESSION
else
    print_status "Session running in background. Use 'tmux attach -t $TMUX_SESSION' to attach later."
fi