#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Digitory Financial OS — Production Deployment Script
# ============================================================
# Usage:
#   ./scripts/deploy.sh              # Deploy with defaults
#   ./scripts/deploy.sh --build      # Force rebuild images
#   ./scripts/deploy.sh --migrate    # Run DB migrations after deploy
#   ./scripts/deploy.sh --setup      # First-time server setup
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.production.yml"
ENV_FILE="$PROJECT_DIR/.env.production"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
info()  { echo -e "${BLUE}[INFO]${NC} $1"; }

BUILD=false
MIGRATE=false
SETUP=false

for arg in "$@"; do
  case $arg in
    --build)   BUILD=true ;;
    --migrate) MIGRATE=true ;;
    --setup)   SETUP=true ;;
    --help)
      echo "Usage: $0 [--build] [--migrate] [--setup]"
      echo "  --build    Force rebuild Docker images"
      echo "  --migrate  Run database migrations after deploy"
      echo "  --setup    First-time server setup (generate secrets)"
      exit 0
      ;;
  esac
done

# ---- Pre-flight checks ----
check_dependencies() {
  log "Checking dependencies..."
  for cmd in docker; do
    if ! command -v "$cmd" &>/dev/null; then
      error "$cmd is required but not installed."
      exit 1
    fi
  done

  if ! docker compose version &>/dev/null; then
    error "Docker Compose v2 is required. Please update Docker."
    exit 1
  fi

  log "All dependencies found."
}

# ---- First-time setup ----
setup() {
  log "Running first-time setup..."

  if [ ! -f "$ENV_FILE" ]; then
    error ".env.production not found. Creating from template..."
    cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
  fi

  # Generate secure secrets
  DB_PASS=$(openssl rand -hex 24)
  JWT_SEC=$(openssl rand -hex 64)
  ENC_KEY=$(openssl rand -hex 16)
  SAL_KEY=$(openssl rand -hex 16)
  REDIS_PASS=$(openssl rand -hex 24)

  sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" "$ENV_FILE"
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SEC|" "$ENV_FILE"
  sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENC_KEY|" "$ENV_FILE"
  sed -i "s|SALARY_ENCRYPTION_KEY=.*|SALARY_ENCRYPTION_KEY=$SAL_KEY|" "$ENV_FILE"
  sed -i "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASS|" "$ENV_FILE"

  log "Secrets generated and written to .env.production"
  warn "IMPORTANT: Back up .env.production securely — these secrets cannot be recovered!"
}

# ---- Deploy ----
deploy() {
  log "Starting deployment..."

  cd "$PROJECT_DIR"

  # Load env vars
  if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    log "Loaded environment from .env.production"
  else
    error ".env.production not found. Run with --setup first."
    exit 1
  fi

  # Build or pull
  if [ "$BUILD" = true ]; then
    log "Building Docker images..."
    docker compose -f "$COMPOSE_FILE" build --no-cache
  else
    log "Building Docker images (cached)..."
    docker compose -f "$COMPOSE_FILE" build
  fi

  # Start services
  log "Starting services..."
  docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

  # Wait for health checks
  log "Waiting for services to be healthy..."
  sleep 10

  # Run migrations if requested
  if [ "$MIGRATE" = true ]; then
    log "Running database migrations..."
    docker compose -f "$COMPOSE_FILE" exec app node -e "
      require('./dist/infrastructure/database/migrate.js');
    " || warn "Migration command not available — run manually if needed."
  fi

  # Cleanup old images
  docker image prune -f &>/dev/null

  log "Deployment complete!"
  echo ""
  info "Services status:"
  docker compose -f "$COMPOSE_FILE" ps
  echo ""
  info "Application is live at: http://$(hostname -I | awk '{print $1}'):80"
  info "Health check: curl http://localhost/health"
}

# ---- Main ----
check_dependencies

if [ "$SETUP" = true ]; then
  setup
fi

deploy
