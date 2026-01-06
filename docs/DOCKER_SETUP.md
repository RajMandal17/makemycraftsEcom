# Docker Setup Guide

This guide describes how to run the MakeMyCrafts platform using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start (Pre-configured Scripts)

We have provided convenient shell scripts for macOS/Linux users:

### 1. Start Database Only (For local backend dev)
This starts MySQL and Redis containers, creating a `localbackend` database.

```bash
./setup-docker-db.sh
```

### 2. Start Full Stack
This starts MySQL, Redis, and the Backend API.

```bash
./docker-start.sh full
```

## Manual Setup

If you prefer running manual commands:

### 1. Database & Redis
```bash
docker-compose up -d mysql redis
```

### 2. Full Stack
```bash
docker-compose up -d
```

### 3. Stop Services
```bash
docker-compose down
```

### 4. Clean Data (Fresh Start)
```bash
docker-compose down -v
```

## Configuration

The Docker setup uses `backend/src/main/resources/application-docker.properties` for the backend configuration.
Ensure your `.env` file (copied from `.env.example`) has the correct credentials if you change them.

## Troubleshooting

**MySQL Connection Refused:**
- Ensure ports 3306 are not occupied by another service.
- Wait 10-20 seconds after starting the container for MySQL to fully initialize.

**Redis Connection Issues:**
- Ensure port 6379 is free.
