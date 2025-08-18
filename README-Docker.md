# AskVeda Docker Deployment Guide

This guide will help you deploy the AskVeda application using Docker containers on a remote machine.

## 🚀 Quick Start

### Prerequisites

1. **Docker & Docker Compose** installed on your remote machine
2. **Git** to clone the repository
3. **SSH access** to your remote machine

### 1. Clone and Setup

```bash
# Clone the repository on your remote machine
git clone <your-repo-url>
cd ask-Veda

# Make the deployment script executable
chmod +x deploy.sh
```

### 2. Environment Configuration

```bash
# Copy environment file
cp env.example .env

# Edit the .env file with your production values
nano .env
```

**Important environment variables to update:**

```env
# Production settings
NODE_ENV=production
PORT=5000

# MongoDB (use strong passwords in production)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/askveda?authSource=admin

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (your domain)
CLIENT_URL=http://your-domain.com

# AI Configuration
FASTAPI_URL=http://localhost:8004
```

### 3. Deploy

```bash
# Deploy the application
./deploy.sh deploy
```

The application will be available at `http://your-server-ip`

## 📋 Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build and Start Services

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d
```

### 2. Check Status

```bash
# View running containers
docker-compose ps

# Check logs
docker-compose logs -f
```

### 3. Health Check

```bash
# Check if all services are healthy
./deploy.sh health
```

## 🔧 Management Commands

### Using the deployment script:

```bash
# Deploy the application
./deploy.sh deploy

# View logs
./deploy.sh logs

# Stop services
./deploy.sh stop

# Restart services
./deploy.sh restart

# Check status
./deploy.sh status

# Health check
./deploy.sh health

# Clean up (removes containers and volumes)
./deploy.sh cleanup
```

### Using Docker Compose directly:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

## 🌐 Production Deployment

### 1. Domain Configuration

For production, you'll want to:

1. **Set up a domain name** pointing to your server
2. **Configure SSL/HTTPS** using Let's Encrypt or similar
3. **Set up a reverse proxy** (nginx) for better security

### 2. SSL Configuration

Add SSL to your nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # ... rest of your nginx config
}
```

### 3. Environment Variables for Production

```env
NODE_ENV=production
CLIENT_URL=https://your-domain.com
JWT_SECRET=your-very-long-and-secure-jwt-secret
MONGODB_URI=mongodb://admin:strong-password@mongodb:27017/askveda?authSource=admin
```

## 📊 Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Monitor Resources

```bash
# Container resource usage
docker stats

# Disk usage
docker system df
```

## 🔒 Security Considerations

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Database Security

- Change default MongoDB passwords
- Use strong JWT secrets
- Enable MongoDB authentication
- Consider using MongoDB Atlas for production

### 3. Container Security

- Run containers as non-root users (already configured)
- Keep images updated
- Use specific image tags instead of `latest`

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :80
   
   # Stop conflicting service
   sudo systemctl stop nginx
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Access MongoDB shell
   docker-compose exec mongodb mongosh
   ```

3. **Build failures**
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Check Dockerfile syntax
   docker build -f Dockerfile.server .
   ```

### Debug Commands

```bash
# Enter a running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Check container health
docker-compose ps

# View container details
docker inspect askveda-backend
```

## 📈 Scaling

### Horizontal Scaling

To scale the backend service:

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3
```

### Load Balancer

For production, consider using a load balancer:

```yaml
# Add to docker-compose.yml
services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
./deploy.sh restart
```

### Database Backups

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /backup
```

### Regular Maintenance

```bash
# Clean up unused images
docker system prune -f

# Update base images
docker-compose pull
docker-compose up -d
```

## 📞 Support

If you encounter issues:

1. Check the logs: `./deploy.sh logs`
2. Verify environment variables
3. Check Docker and Docker Compose versions
4. Ensure all ports are available
5. Verify network connectivity

For additional help, check the main README.md file or create an issue in the repository.
