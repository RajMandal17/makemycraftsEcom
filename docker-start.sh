#!/bin/bash

# ===========================================
# MakeMyCrafts Docker Quick Start Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 MakeMyCrafts Docker Setup${NC}"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file. Please update it with your configuration.${NC}"
fi

# Function to show usage
show_usage() {
    echo ""
    echo "Usage: ./docker-start.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  db-only     Start only MySQL and Redis (for development)"
    echo "  full        Start full stack (MySQL, Redis, Backend)"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs from all services"
    echo "  clean       Stop and remove all containers and volumes"
    echo "  help        Show this help message"
    echo ""
}

# Parse command
case "${1:-db-only}" in
    db-only)
        echo -e "${GREEN}🔧 Starting MySQL and Redis only...${NC}"
        docker-compose up -d mysql redis
        echo ""
        echo -e "${GREEN}✅ Database services started!${NC}"
        echo ""
        echo "MySQL is available at: localhost:3306"
        echo "  Database: localbackend"
        echo "  Username: artwork_user"
        echo "  Password: artwork_password"
        echo ""
        echo "Redis is available at: localhost:6379"
        echo ""
        echo "Run your backend with:"
        echo "  cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev"
        ;;
    
    full)
        echo -e "${GREEN}🔧 Starting full stack (MySQL, Redis, Backend)...${NC}"
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✅ Full stack started!${NC}"
        echo ""
        echo "Services:"
        echo "  Backend API: http://localhost:8081"
        echo "  MySQL: localhost:3306"
        echo "  Redis: localhost:6379"
        echo ""
        echo "View logs with: docker-compose logs -f"
        ;;
    
    stop)
        echo -e "${YELLOW}🛑 Stopping all services...${NC}"
        docker-compose down
        echo -e "${GREEN}✅ All services stopped${NC}"
        ;;
    
    restart)
        echo -e "${YELLOW}🔄 Restarting all services...${NC}"
        docker-compose restart
        echo -e "${GREEN}✅ All services restarted${NC}"
        ;;
    
    logs)
        echo -e "${GREEN}📋 Showing logs (Ctrl+C to exit)...${NC}"
        docker-compose logs -f
        ;;
    
    clean)
        echo -e "${RED}⚠️  This will remove all containers and volumes (data will be lost)${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}🧹 Cleaning up...${NC}"
            docker-compose down -v
            echo -e "${GREEN}✅ Cleanup complete${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    
    help)
        show_usage
        ;;
    
    *)
        echo -e "${RED}❌ Invalid option: $1${NC}"
        show_usage
        exit 1
        ;;
esac

echo ""
echo "Status:"
docker-compose ps
