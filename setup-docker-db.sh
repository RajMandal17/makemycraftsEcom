    #!/bin/bash

    # ===========================================
    # Setup Script for Docker Database
    # ===========================================
    # This script helps you set up Docker MySQL for local development
    # ===========================================

    set -e

    # Colors
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'

    echo -e "${GREEN}=========================================="
    echo "🐳 Docker MySQL Setup for Local Dev"
    echo "==========================================${NC}"
    echo ""

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker is not running!${NC}"
        echo ""
        echo "Please start Docker Desktop:"
        echo "  1. Open Docker Desktop app"
        echo "  2. Wait for it to start"
        echo "  3. Run this script again"
        echo ""
        exit 1
    fi

    echo -e "${GREEN}✅ Docker is running${NC}"
    echo ""

    # Check if .env file exists
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Creating .env file from template...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo ""
    fi

    echo -e "${BLUE}Step 1: Starting Docker MySQL and Redis...${NC}"
    docker-compose up -d mysql redis

    echo ""
    echo -e "${BLUE}Step 2: Waiting for MySQL to be healthy...${NC}"
    echo "This may take 10-20 seconds..."

    # Wait for MySQL to be healthy
    attempt=0
    max_attempts=30
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps mysql | grep -q "healthy"; then
            echo -e "${GREEN}✅ MySQL is ready!${NC}"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ $attempt -eq $max_attempts ]; then
        echo ""
        echo -e "${YELLOW}⚠️  MySQL took too long to start. Check logs:${NC}"
        echo "  docker-compose logs mysql"
        exit 1
    fi

    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ Docker Setup Complete!"
    echo "==========================================${NC}"
    echo ""
    echo "Your local Docker databases are running:"
    echo ""
    echo "📊 MySQL Database:"
    echo "   Host: localhost"
    echo "   Port: 3306"
    echo "   Database: localbackend"
    echo "   Username: artwork_user"
    echo "   Password: artwork_password"
    echo ""
    echo "🔴 Redis Cache:"
    echo "   Host: localhost"
    echo "   Port: 6379"
    echo ""
    echo "🚀 Next Steps:"
    echo ""
    echo "1. Run your backend:"
    echo "   cd backend"
    echo "   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev"
    echo ""
    echo "2. Your backend will automatically connect to Docker MySQL"
    echo ""
    echo "3. To stop Docker databases:"
    echo "   docker-compose down"
    echo ""
    echo "4. To view logs:"
    echo "   docker-compose logs -f mysql"
    echo ""
