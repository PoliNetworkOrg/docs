---
title: Telegram Bot Local Setup
---

## Introduction

This workspace contains two services:
- `backend/` - Postgres backend
- `telegram/` - Telegram bot (requires the backend)

This guide walks through setting up both services locally for development.

## Requirements

- Docker (for Postgres, Redis and InfluxDB)
- `bun` installed for `backend/`
- `pnpm` installed for `telegram/`
- A Telegram bot token from BotFather
- Optional: `data-peek` or any Postgres client to inspect/manipulate the DB

## Start supporting services

### Postgres

Postgres is required for the backend. You can run it in a Docker container:

```sh
docker run --name pn-backend-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=polinetwork_backend -p 5432:5432 -d postgres:15
```

### Redis + InfluxDB

> Note: You must modify the `docker-compose.yml` to set authentication for Redis and InfluxDB parameters you define in your `telegram/.env` file.

The Telegram repo already contains a `docker-compose.yml` for Redis and InfluxDB.

From the repo root:

```sh
cd telegram
docker compose up -d
```

This will start:
- Redis on `6379`
- InfluxDB on `8086`

## Backend setup

### Create backend `.env`

Copy `backend/.env.example` to `backend/.env` and fill values.

Required values for local dev:

```ini
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=polinetwork_backend
ENCRYPTION_KEY=<64+ hex chars>
BETTER_AUTH_SECRET=<40 hex chars>
AZURE_TENANT_ID=dummy
AZURE_CLIENT_ID=dummy
AZURE_CLIENT_SECRET=dummy
AZURE_EMAIL_SENDER=noreply@polinetwork.org
AZURE_BLOB_STORAGE_ACCOUNT=polinetworksa
AZURE_BLOB_STORAGE_CONTAINER=file-blobs
```

The Azure env values are currently required by `backend/src/env.ts` but you can use dummy values for local development if you do not intend to use Azure features.

#### Generate secrets

Generate the `ENCRYPTION_KEY` and `BETTER_AUTH_SECRET` values.

If you have `openssl` installed:

```sh
openssl rand -hex 32
openssl rand -hex 20
```

Or with Python:

```sh
python -c "import os, binascii; print(binascii.hexlify(os.urandom(32)).decode())"
python -c "import os, binascii; print(binascii.hexlify(os.urandom(20)).decode())"
```

### Install and run backend

```sh
cd backend
bun install
bun db:migrate
bun dev
```

The backend should start on `http://localhost:3000`.

## Telegram bot setup

### Create telegram `.env`

Copy `telegram/.env.example` to `telegram/.env` and fill values.

Required values:

```ini
BOT_TOKEN=<telegram bot token>

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
BACKEND_URL=localhost:3000
REDIS_USERNAME=default
REDIS_PASSWORD=<your Redis password>
INFLUXDB_TOKEN=<32+ char token>
INFLUXDB_URL=http://localhost:8086
```

### Install and run bot

```sh
cd telegram
pnpm install
pnpm run dev
```

The bot will connect to Redis and the backend. It uses `http://${BACKEND_URL}/api/trpc` internally.

## Role / permission setup

The bot uses the backend role system. Telegram users are stored in `tg.users`, but permissions are stored separately in `tg.permissions`.

If you want owner/admin access immediately, insert or update a row in `tg.permissions` for your Telegram user ID.

Example SQL:

```sql
INSERT INTO tg.permissions (user_id, roles, added_by)
VALUES (<YOUR_TELEGRAM_ID>, ARRAY['owner'], <YOUR_TELEGRAM_ID>)
ON CONFLICT (user_id) DO UPDATE
SET roles = ARRAY['owner'], added_by = <YOUR_TELEGRAM_ID>;
```

If you already interacted with the bot, your `tg.users` row should exist. If not, send a message to the bot so it creates your user row.

### Recommended manual data access

Use `data-peek` or any Postgres client with this DSN:

```text
postgresql://postgres:postgres@127.0.0.1:5432/polinetwork_backend
```

Inspect:
- `tg.permissions`
- `tg.users`
- other `tg.*` tables if needed

## Notes

- `telegram/` must be able to reach the backend at `localhost:3000`.
- `backend/` uses `USE_DEV_MAILER=true` by default in development, so Azure email sending is not required for local testing.
- If you use dummy Azure authentication values, the backend will still try to authenticate with Azure, which will fail. This is expected and non-fatal for local development. The backend will still run, and the bot can connect to it.
- The bot must be admin in the Telegram group/channel it is used in, otherwise it will not be able to perform moderation actions.

## Quick checklist

1. Docker Postgres running
2. Docker Redis running
3. `backend/.env` configured
4. `bun install` + `bun db:migrate` + `bun dev`
5. `telegram/.env` configured
6. `pnpm install` + `pnpm run dev`
7. `tg.permissions` row exists for your Telegram ID



## Optional automation script

You can automate the local startup for Postgres, Redis, InfluxDB, the backend, and the bot by saving the following shell script and running it from a root directory containing the `telegram` and `backend` directories.

Before running the script, export `REDIS_PASSWORD` with the password configured for Redis (the same value as `REDIS_PASSWORD` in `telegram/.env`):

```bash
export REDIS_PASSWORD='<your Redis password>'
```

```bash
#!/usr/bin/env bash
set -euo pipefail
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect OS environment
IS_WINDOWS=false
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  IS_WINDOWS=true
fi

# --- Pre-flight Checks ---
echo "Checking required system dependencies..."
for cmd in docker bun pnpm curl; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "Error: Required command '$cmd' is not installed or not in your PATH." >&2
    exit 1
  fi
done

# --- Helper Functions ---
wait_for_port() {
  local host="${1:-127.0.0.1}"
  local port="${2}"
  local timeout="${3:-60}"
  local end=$((SECONDS + timeout))

  while (( SECONDS < end )); do
    if command -v nc &> /dev/null; then
      if nc -z "$host" "$port" >/dev/null 2>&1; then return 0; fi
    elif bash -c "cat < /dev/null > /dev/tcp/${host}/${port}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

wait_for_http() {
  local url="${1}"
  local timeout="${2:-60}"
  local end=$((SECONDS + timeout))

  while (( SECONDS < end )); do
    if curl -fsSL --max-time 3 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

kill_process_on_port() {
  local port="${1}"
  
  if [ "$IS_WINDOWS" = true ]; then
    if command -v netstat.exe &> /dev/null; then
      local win_pid
      win_pid=$(netstat.exe -ano | grep "LISTENING" | grep ":$port " | awk '{print $5}' | head -n 1 || true)
      if [ -n "$win_pid" ] && [ "$win_pid" -gt 0 ] 2>/dev/null; then
        echo "Port $port occupied on Windows. Cleaning up PID $win_pid..."
        taskkill.exe /F /PID "$win_pid" >/dev/null 2>&1 || true
      fi
    fi
  else
    if command -v lsof &> /dev/null; then
      local pid
      pid=$(lsof -t -i:"$port" || true)
      if [ -n "$pid" ]; then
        echo "Port $port occupied. Cleaning up process $pid..."
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
  fi
}

# --- Environment Cleanup ---
if wait_for_port 127.0.0.1 3000 1; then
  read -r -p "Port 3000 is in use. Force-kill its process before starting the backend? [y/N] " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    kill_process_on_port 3000
  else
    echo "Port 3000 is still in use. Stop the existing process and run this script again." >&2
    exit 1
  fi
fi

# --- Infrastructure Setup ---
echo "Starting Postgres container..."
if ! docker ps -a --format '{{.Names}}' | grep -xq 'pn-backend-postgres'; then
  docker run --name pn-backend-postgres \
    -e POSTGRES_USER="${POSTGRES_USER:-postgres}" \
    -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}" \
    -e POSTGRES_DB="${POSTGRES_DB:-polinetwork_backend}" \
    -p 5432:5432 \
    -d postgres:15
else
  docker start pn-backend-postgres >/dev/null
fi

echo "Starting Redis + InfluxDB via telegram/docker-compose.yml..."
pushd "$SCRIPT_ROOT/telegram" >/dev/null
docker compose up -d
popd >/dev/null

echo "Waiting for Docker services to be reachable..."
if ! wait_for_port 127.0.0.1 5432 60; then
  echo "Error: Postgres not responding on 127.0.0.1:5432" >&2
  exit 1
fi
if ! wait_for_port 127.0.0.1 6379 60; then
  echo "Error: Redis not responding on 127.0.0.1:6379" >&2
  exit 1
fi
if ! wait_for_http http://127.0.0.1:8086/health 60; then
  echo "Error: InfluxDB not responding on http://127.0.0.1:8086/health" >&2
  exit 1
fi

echo "Waiting for Redis initialization..."
if [ -z "${REDIS_PASSWORD:-}" ]; then
  echo "Error: REDIS_PASSWORD must be set before running this script." >&2
  exit 1
fi
REDIS_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E 'redis_db' | head -n 1 || true)
if [ -z "$REDIS_CONTAINER" ]; then
  REDIS_CONTAINER="redis_db"
fi

for i in {1..60}; do
  if docker exec "$REDIS_CONTAINER" redis-cli -a "$REDIS_PASSWORD" ping >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "Error: Redis ping did not succeed after 60 seconds" >&2
    exit 1
  fi
done

# --- Application Bootstrapping ---
echo "Preparing backend (install + migrate)..."
pushd "$SCRIPT_ROOT/backend" >/dev/null
bun install
bun db:migrate
popd >/dev/null

echo "Launching backend in background (logs: backend.log)..."

cd "$SCRIPT_ROOT/backend"
nohup bun dev > "$SCRIPT_ROOT/backend.log" 2>&1 </dev/null &
backend_pid=$!
cd "$SCRIPT_ROOT"

echo "Waiting for backend HTTP endpoint http://localhost:3000/ to respond..."
if ! wait_for_http http://localhost:3000/ 60; then
  echo "Error: Backend did not respond on http://localhost:3000 within timeout" >&2
  exit 1
fi

echo "Preparing bot dependencies..."
pushd "$SCRIPT_ROOT/telegram" >/dev/null
pnpm install
popd >/dev/null

echo "Launching bot in background (logs: bot.log)..."
cd "$SCRIPT_ROOT/telegram"
nohup pnpm run dev > "$SCRIPT_ROOT/bot.log" 2>&1 </dev/null &
bot_pid=$!
cd "$SCRIPT_ROOT"

echo "All done! Setup successfully initialized cross-platform."
echo "-------------------------------------------------------"
echo "Backend PID: $backend_pid (Logs: tail -f backend.log)"
echo "Bot PID:     $bot_pid (Logs: tail -f bot.log)"
echo "-------------------------------------------------------"
```

> Note: This script requires a POSIX shell environment with `bash`, `curl`, and Docker available. On Windows, use WSL, Git Bash, or a Linux-compatible shell.
