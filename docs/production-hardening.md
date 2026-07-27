# Ravora Production Readiness & Operations Guide

This document contains architectural diagrams, API schemas, deployment blueprints, backup procedures, and disaster recovery guides to harden Ravora for beta users.

---

## 1. System Architecture & Component Mapping

The following schema maps Ravora's data pipelines, AI services, caching layers, and background synchronization workers:

```mermaid
graph TD
    User([Beta User Client]) --> |HTTPS / WSS| Gateway[Express Gateway / Port 3001]
    
    subgraph Gateway Layer
        Gateway --> Auth[JWT & Supabase Authenticator]
        Gateway --> RateLimiter[Sliding Window Rate Limiter]
        Gateway --> SecureHeaders[Helmet / Security Cors]
    end

    subgraph Business Logics
        Auth --> Agent[Araiven Agent Orchestrator]
        Auth --> PortService[Portfolio Intelligence Service]
        Auth --> Execution[Trade Execution / Queue]
    end

    subgraph Cache & Storage
        Agent --> Cache[In-Memory Caches / 1-5m TTL]
        Agent --> MemoryRepos[Personalization & Learning Repositories]
        MemoryRepos --> PG[(Supabase PostgreSQL)]
        MemoryRepos -.-> |Self-Healing Fallback| MemStore[Memory Stores]
    end

    subgraph Background Sync Workers
        JobSched[Job Scheduler] --> MarketWorker[Market Sync Worker]
        JobSched --> PortfolioWorker[Portfolio Sync Worker]
        JobSched --> NewsWorker[News Ingestion Worker]
    end
```

---

## 2. API Schema Reference

Ravora hosts endpoints mounted under `/api/v1` and `/api/ai` directly. All endpoints require a standard Bearer JWT header unless marked public:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check check | No |
| `POST` | `/api/v1/auth/signup` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user and retrieve JWT | No |
| `POST` | `/api/ai/chat` | Main orchestrator ask (streaming/standard) | Yes |
| `POST` | `/api/ai/chat/stream` | Dedicated SSE chat stream | Yes |
| `POST` | `/api/ai/agent` | Returns reasoning path, symbols, and response | Yes |
| `POST` | `/api/ai/analyze/stream` | SSE market/asset indicators analysis | Yes |
| `POST` | `/api/ai/review/stream` | SSE portfolio/risk pre-trade safety audits | Yes |
| `GET` | `/api/ai/memory` | Retrieves user preference, learning logs | Yes |
| `DELETE`| `/api/ai/memory` | Resets personalisation memory | Yes |
| `GET` | `/api/ai/preferences` | Retrieves user profile stances | Yes |
| `PUT` | `/api/ai/preferences` | Updates user personalization prefs | Yes |
| `GET` | `/api/admin/diagnostics` | Serving HTML/JSON health charts | Yes (Admin) |

---

## 3. Production Deployment & Zero-Downtime Blueprint

Ravora is fully dockerized with minimal dependency footprints and built-in health audits:

### Build Container
```bash
docker build -t ravorahq/ravora:1.0.0 -f Dockerfile .
```

### Start Services via docker-compose
Create a `.env` file containing production credentials, then run:
```bash
docker-compose up -d
```

### Zero-Downtime Deployment (Rolling Updates)
To release updates with zero-downtime, utilize Docker Swarm or Kubernetes rolling updates. In a standalone environment, run:
```bash
# 1. Pull latest image
docker-compose pull ravora-app

# 2. Scale up to 2 instances
docker-compose up -d --scale ravora-app=2 --no-recreate

# 3. Stop and remove the old instance
# (Traffic will seamlessly route to the healthy healthchecked instance)
docker-compose kill -s SIGTERM ravora-app_1
docker-compose rm -f ravora-app_1
```

---

## 4. Backup, Recovery & Rollback Procedures

### 4.1 Database Backup Script
For automated backups in PostgreSQL (Supabase), register a daily Cron job running:
```bash
#!/bin/bash
# pg_backup.sh
BACKUP_DIR="/var/backups/ravora"
TIMESTAMP=$(date +%F_%H%M%S)
DATABASE_URL="postgresql://postgres:[password]@db.[supabase-project].supabase.co:5432/postgres"

mkdir -p "$BACKUP_DIR"
pg_dump "$DATABASE_URL" -F c -b -v -f "$BACKUP_DIR/ravora_$TIMESTAMP.backup"

# Keep only the last 30 backups
find "$BACKUP_DIR" -type f -mtime +30 -name "*.backup" -exec rm -f {} \;
```

### 4.2 Database Restore Script
To recover data in the event of an outage or migration failure:
```bash
#!/bin/bash
# pg_restore.sh
BACKUP_FILE=$1
DATABASE_URL="postgresql://postgres:[password]@db.[supabase-project].supabase.co:5432/postgres"

if [ -z "$BACKUP_FILE" ]; then
  echo "Error: Specify a backup filepath to restore"
  exit 1
fi

pg_restore -d "$DATABASE_URL" -v --clean --no-acl --no-owner "$BACKUP_FILE"
```

### 4.3 Database Migration Rollback
If a Prisma/Supabase SQL migration causes issues:
1. Identify the failing migration files in the repo.
2. Draft a rollback script reversing changes (e.g. `DROP TABLE`, `ALTER TABLE DROP COLUMN`).
3. Run the rollback script using `psql` or Supabase CLI:
   ```bash
   psql "$DATABASE_URL" -f migrations/rollback_xxx.sql
   ```

---

## 5. Operations & Disaster Recovery (DR) Checklist

### 5.1 Outage Scenario: Database Connectivity Issues
1. Access the Admin Diagnostics panel: `GET /api/admin/diagnostics`.
2. Inspect the `database.error` value to understand the failure (network issue vs credential invalidation).
3. Check the Supabase status page: `https://status.supabase.com`.
4. If remote DB is down, toggle the Ravora local sandbox mode (set `SUPABASE_URL` empty to force automatic self-healing memory store fallback).

### 5.2 Outage Scenario: Gemini API Failures (Rate Limits or Keys Revoked)
1. Verify Gemini status in the diagnostics panel under `ai.configured`.
2. Ping Gemini API endpoints directly using Curl to verify key permissions.
3. If API keys are blocked or throttled:
   - Provide a secondary key in the environment variables.
   - Restart the server: `docker-compose restart ravora-app`.

### 5.3 Outage Scenario: Memory Leak or Process Crash
1. System container will automatically trigger restart via the `restart: unless-stopped` compose directive.
2. View process logs: `docker-compose logs --tail=100 -f`.
3. Track heap memory metrics on the diagnostics panel. If heap size exceeds 80% limit, check for active unclosed SSE/WebSocket connections.
