#!/usr/bin/env bash
set -euo pipefail

# Unified Development Script for Platform
# Starts both backend and frontend with automatic port detection
# Works on both macOS and Linux
#
# Usage: ./dev.sh [--no-dev-mode] [--ports]
#   --no-dev-mode  Disable dev mode (test auth, seeding)
#   --ports        Print running server ports as JSON and exit

# Parse arguments - dev-mode is enabled by default
DEV_MODE=true
PRINT_PORTS=false
for arg in "$@"; do
    case $arg in
        --no-dev-mode)
            DEV_MODE=false
            ;;
        --ports)
            PRINT_PORTS=true
            ;;
        *)
            echo "Unknown argument: $arg"
            echo "Usage: ./dev.sh [--no-dev-mode] [--ports]"
            exit 1
            ;;
    esac
done

# Set cargo features based on dev mode
if [[ "$DEV_MODE" == true ]]; then
    CARGO_FEATURES="--features dev-mode"
else
    CARGO_FEATURES=""
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTS_FILE="$SCRIPT_DIR/.dev-ports"
cd "$SCRIPT_DIR"

# Configuration
BACKEND_START_PORT="${EXCHANGE_PORT:-8080}"
BACKEND_LOG_FILE=$(mktemp)
BACKEND_PID=""
FRONTEND_PID=""
TAIL_PID=""

# Colors for output (if terminal supports it)
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if a port is available (works on both Mac and Linux)
is_port_available() {
    local port=$1
    if command -v lsof &> /dev/null; then
        ! lsof -i ":$port" &> /dev/null
    elif command -v ss &> /dev/null; then
        ! ss -tuln | grep -q ":$port "
    elif command -v netstat &> /dev/null; then
        ! netstat -tuln | grep -q ":$port "
    else
        # Fallback: try to bind briefly
        (echo > /dev/tcp/127.0.0.1/$port) 2>/dev/null && return 1 || return 0
    fi
}

# Find an available port starting from the given port
find_available_port() {
    local port=$1
    local max_attempts=100
    local attempt=0
    while [[ $attempt -lt $max_attempts ]]; do
        if is_port_available "$port"; then
            echo "$port"
            return 0
        fi
        # Output to stderr so it doesn't get captured by command substitution
        echo -e "${YELLOW}[WARN]${NC} Port $port is in use, trying $((port + 1))" >&2
        ((port++))
        ((attempt++))
    done
    return 1
}

# Cleanup function - handles graceful shutdown
cleanup() {
    local exit_code=$?
    log_info "Shutting down..."

    # Kill tail process
    if [[ -n "$TAIL_PID" ]] && kill -0 "$TAIL_PID" 2>/dev/null; then
        kill -TERM "$TAIL_PID" 2>/dev/null || true
    fi

    # Kill backend if running
    if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_info "Stopping backend (PID: $BACKEND_PID)..."
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
        sleep 1
        kill -KILL "$BACKEND_PID" 2>/dev/null || true
    fi

    # Kill frontend if running
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_info "Stopping frontend (PID: $FRONTEND_PID)..."
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
        sleep 1
        kill -KILL "$FRONTEND_PID" 2>/dev/null || true
    fi

    # Clean up temp files
    rm -f "$BACKEND_LOG_FILE"
    rm -f "$PORTS_FILE"

    log_info "Cleanup complete."
    exit $exit_code
}

# Set up signal handlers
trap cleanup EXIT INT TERM HUP

# ============================================================================
# Setup: Install dependencies and create database if needed
# ============================================================================

# Check and install pnpm dependencies
if [[ ! -d "$SCRIPT_DIR/node_modules" ]]; then
    log_info "Installing pnpm dependencies..."
    pnpm install
    log_success "Dependencies installed"
else
    log_info "Dependencies already installed (node_modules exists)"
fi

# Check and install sqlx-cli
if ! command -v sqlx &> /dev/null; then
    log_info "Installing sqlx-cli..."
    cargo install sqlx-cli
    log_success "sqlx-cli installed"
else
    log_info "sqlx-cli already installed"
fi

# Check and create backend .env from example if missing
if [[ ! -f "$SCRIPT_DIR/backend/.env" ]]; then
    if [[ -f "$SCRIPT_DIR/backend/example.env" ]]; then
        log_info "Creating backend/.env from example.env..."
        cp "$SCRIPT_DIR/backend/example.env" "$SCRIPT_DIR/backend/.env"
        log_success "Created backend/.env (you may need to update values)"
    else
        log_error "backend/.env missing and no example.env found"
        exit 1
    fi
else
    log_info "Backend .env already exists"
fi

# Always copy frontend/local.env to frontend/.env for local backend testing
if [[ -f "$SCRIPT_DIR/frontend/local.env" ]]; then
    log_info "Syncing frontend/.env from frontend/local.env..."
    cp "$SCRIPT_DIR/frontend/local.env" "$SCRIPT_DIR/frontend/.env"
    log_success "Synced frontend/.env from local.env"
else
    log_error "frontend/local.env missing; cannot create frontend/.env"
    exit 1
fi

# Check and create database
if [[ ! -f "$SCRIPT_DIR/backend/db.sqlite" ]]; then
    log_info "Creating database..."
    cd "$SCRIPT_DIR/backend"
    DATABASE_URL="sqlite://db.sqlite" sqlx db create
    DATABASE_URL="sqlite://db.sqlite" sqlx migrate run
    cd "$SCRIPT_DIR"
    log_success "Database created and migrations applied"
else
    log_info "Database already exists (backend/db.sqlite)"
fi

# ============================================================================
# Build and run
# ============================================================================

# Build schema-js (required for frontend)
log_info "Building schema-js..."
pnpm --filter schema-js build-proto

# Start backend
if [[ "$DEV_MODE" == true ]]; then
    log_info "Starting backend (initial port: $BACKEND_START_PORT, dev-mode enabled)..."
else
    log_info "Starting backend (initial port: $BACKEND_START_PORT, dev-mode disabled)..."
fi

cd "$SCRIPT_DIR/backend"

# Start backend in background, capturing output to log file
EXCHANGE_PORT="$BACKEND_START_PORT" cargo run $CARGO_FEATURES >> "$BACKEND_LOG_FILE" 2>&1 &
BACKEND_PID=$!

# Tail the log file to show output
tail -f "$BACKEND_LOG_FILE" &
TAIL_PID=$!

# Wait for backend to be ready and extract the actual port
log_info "Waiting for backend to start..."
BACKEND_PORT=""
TIMEOUT=120
ELAPSED=0

while [[ -z "$BACKEND_PORT" ]] && [[ $ELAPSED -lt $TIMEOUT ]]; do
    # Check if backend process is still running
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_error "Backend process died unexpectedly"
        cat "$BACKEND_LOG_FILE"
        exit 1
    fi

    # Try to extract port from log
    # Looking for: "BACKEND_READY port=8080"
    if grep -q "BACKEND_READY port=" "$BACKEND_LOG_FILE" 2>/dev/null; then
        BACKEND_PORT=$(grep "BACKEND_READY port=" "$BACKEND_LOG_FILE" | sed -n 's/.*BACKEND_READY port=\([0-9]*\).*/\1/p' | head -1)
    fi

    if [[ -z "$BACKEND_PORT" ]]; then
        sleep 1
        ((ELAPSED++)) || true
    fi
done

if [[ -z "$BACKEND_PORT" ]]; then
    log_error "Timed out waiting for backend to start"
    cat "$BACKEND_LOG_FILE"
    exit 1
fi

log_success "Backend started on port $BACKEND_PORT"

# Start frontend with dynamic configuration
cd "$SCRIPT_DIR/frontend"

# Find an available port for Vite (default start is 5173)
VITE_START_PORT="${VITE_PORT:-5173}"
VITE_PORT=$(find_available_port "$VITE_START_PORT")
if [[ -z "$VITE_PORT" ]]; then
    log_error "Could not find available port for frontend"
    exit 1
fi

# Auto-calculate PUBLIC_SERVER_URL if not set
if [[ -z "${PUBLIC_SERVER_URL:-}" ]]; then
    export PUBLIC_SERVER_URL="/api"
    log_info "AUTO: PUBLIC_SERVER_URL=$PUBLIC_SERVER_URL"
fi

# Auto-calculate PUBLIC_KINDE_REDIRECT_URI if not set
if [[ -z "${PUBLIC_KINDE_REDIRECT_URI:-}" ]]; then
    export PUBLIC_KINDE_REDIRECT_URI="http://localhost:${VITE_PORT}"
    log_info "AUTO: PUBLIC_KINDE_REDIRECT_URI=$PUBLIC_KINDE_REDIRECT_URI"
fi

# Export exchange URL for vite.config.ts
export EXCHANGE_URL="ws://localhost:${BACKEND_PORT}"

log_info "Starting frontend (Vite port: $VITE_PORT, Backend port: $BACKEND_PORT)..."

# Start Vite dev server with --strictPort to ensure it uses our chosen port
pnpm dev --port "$VITE_PORT" --strictPort &
FRONTEND_PID=$!

# Write ports to file for other tools (e.g., playwright) to discover
cat > "$PORTS_FILE" << EOF
{"frontend": $VITE_PORT, "backend": $BACKEND_PORT}
EOF

echo ""
log_info "============================================"
log_info "Development servers running:"
log_info "  Frontend: http://localhost:$VITE_PORT"
log_info "  Backend:  http://localhost:$BACKEND_PORT"
log_info "============================================"
log_info "Ports saved to .dev-ports"
log_info "Press Ctrl+C to stop all servers"
echo ""

# Wait for processes - use polling for compatibility with older bash
while true; do
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_warn "Backend exited"
        break
    fi
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_warn "Frontend exited"
        break
    fi
    sleep 1
done
