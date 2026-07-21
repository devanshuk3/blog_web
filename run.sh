#!/bin/bash

# Directories and PID files
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID_FILE="$ROOT_DIR/.backend.pid"
FRONTEND_PID_FILE="$ROOT_DIR/.frontend.pid"
LOG_DIR="$ROOT_DIR/.logs"

mkdir -p "$LOG_DIR"

start_servers() {
  echo "Starting servers..."

  # Start backend
  if [ -f "$BACKEND_PID_FILE" ] && kill -0 $(cat "$BACKEND_PID_FILE") 2>/dev/null; then
    echo "Backend is already running (PID: $(cat "$BACKEND_PID_FILE"))."
  else
    (cd "$ROOT_DIR/backend" && node server.js > "$LOG_DIR/backend.log" 2>&1 & echo $! > "$BACKEND_PID_FILE")
    echo "Backend started (PID: $(cat "$BACKEND_PID_FILE"))."
  fi

  # Start frontend
  if [ -f "$FRONTEND_PID_FILE" ] && kill -0 $(cat "$FRONTEND_PID_FILE") 2>/dev/null; then
    echo "Frontend is already running (PID: $(cat "$FRONTEND_PID_FILE"))."
  else
    (cd "$ROOT_DIR/frontend" && npm run dev > "$LOG_DIR/frontend.log" 2>&1 & echo $! > "$FRONTEND_PID_FILE")
    echo "Frontend started (PID: $(cat "$FRONTEND_PID_FILE"))."
  fi
}

stop_servers() {
  echo "Stopping servers..."

  if [ -f "$BACKEND_PID_FILE" ]; then
    PID=$(cat "$BACKEND_PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      kill -9 "$PID" 2>/dev/null
      echo "Backend stopped (PID: $PID)."
    else
      echo "Backend process not running."
    fi
    rm -f "$BACKEND_PID_FILE"
  else
    echo "Backend is not running."
  fi
  fuser -k 5000/tcp 2>/dev/null || true

  if [ -f "$FRONTEND_PID_FILE" ]; then
    PID=$(cat "$FRONTEND_PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      kill -9 "$PID" 2>/dev/null
      echo "Frontend stopped (PID: $PID)."
    else
      echo "Frontend process not running."
    fi
    rm -f "$FRONTEND_PID_FILE"
  else
    echo "Frontend is not running."
  fi
  fuser -k 5173/tcp 2>/dev/null || true
}

status_servers() {
  echo "Server status:"

  if [ -f "$BACKEND_PID_FILE" ] && kill -0 $(cat "$BACKEND_PID_FILE") 2>/dev/null; then
    echo "  Backend:  RUNNING (PID: $(cat "$BACKEND_PID_FILE"))"
  else
    echo "  Backend:  STOPPED"
  fi

  if [ -f "$FRONTEND_PID_FILE" ] && kill -0 $(cat "$FRONTEND_PID_FILE") 2>/dev/null; then
    echo "  Frontend: RUNNING (PID: $(cat "$FRONTEND_PID_FILE"))"
  else
    echo "  Frontend: STOPPED"
  fi
}

case "$1" in
  start)
    start_servers
    ;;
  stop)
    stop_servers
    ;;
  status)
    status_servers
    ;;
  restart)
    stop_servers
    sleep 2
    start_servers
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart}"
    exit 1
    ;;
esac
