#!/bin/bash

# AskVeda Docker Deployment Script
# This script automates the deployment of the AskVeda application using Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from env.example..."
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
            print_warning "Please update the .env file with your production values"
        else
            print_error "env.example file not found. Please create a .env file manually."
            exit 1
        fi
    else
        print_success ".env file found"
    fi
}

# Build and start containers
deploy() {
    print_status "Starting deployment..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_error "MongoDB is not healthy"
        return 1
    fi
    
    # Check Backend
    if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not healthy"
        return 1
    fi
    
    # Check Frontend
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not healthy"
        return 1
    fi
}

# Show logs
show_logs() {
    print_status "Showing logs..."
    docker-compose logs -f
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Show status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Main script
main() {
    case "${1:-deploy}" in
        "deploy")
            check_docker
            check_env_file
            deploy
            print_success "Deployment completed successfully!"
            print_status "Your application is available at: http://localhost"
            ;;
        "logs")
            show_logs
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            deploy
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "health")
            check_health
            ;;
        *)
            echo "Usage: $0 {deploy|logs|stop|restart|status|cleanup|health}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy the application (default)"
            echo "  logs     - Show application logs"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  status   - Show service status"
            echo "  cleanup  - Stop and remove all containers and volumes"
            echo "  health   - Check service health"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
