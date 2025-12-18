# 🚀 DevOps Voting App - Microservices Reference

This project is a 3-tier microservice application designed for DevOps training and deployment demonstrations.

## 🏗 Project Structure

- **Frontend**: React (Vite) + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: MySQL 8.0

---

## 🛠 Running Locally (Manual Setup)

### 1. Database Setup
- Install MySQL 8.0.
- Execute the initialization script:
  ```bash
  mysql -u root -p < backend/database/init.sql
  ```

### 2. Backend Setup
- Navigate to the backend folder: `cd backend`
- Install dependencies: `npm install`
- Create an environment file or set variables:
  ```bash
  export DB_HOST=localhost
  export DB_USER=devops
  export DB_PASSWORD=password
  export DB_NAME=voting_app
  ```
- Start the server: `npm start` (Runs on port 5000)

### 3. Frontend Setup
- Navigate to the frontend folder: `cd frontend`
- Install dependencies: `npm install`
- Start the development server: `npm run dev` (Runs on port 3000)

---

## 🐳 Running with Docker (Recommended)

One command to start the entire stack:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

---

## ☸️ Kubernetes Deployment Guide

When moving to Kubernetes, keep the following in mind:

### 1. Environment Variables
Map these in your `Deployment` manifests using `ConfigMaps` or `Secrets`:
- `DB_HOST`: The DNS name of your MySQL service (e.g., `mysql-svc`).
- `DB_USER`: Database username.
- `DB_PASSWORD`: (Use K8s Secret).
- `DB_NAME`: `voting_app`.

### 2. Multi-Service Architecture Changes
To evolve this into a true distributed microservice system:
- **Service Splitting**: Separate `auth` and `voting` logic into two distinct Node.js services.
- **Ingress Controller**: Use Nginx Ingress to route `/api/auth` to the Auth Service and `/api/vote` to the Voting Service.
- **StatefulSets**: Use a `StatefulSet` for MySQL instead of a standard `Deployment` to handle stable network IDs and persistent storage (PVC).
- **Service Discovery**: Utilize Kubernetes internal DNS for service-to-service communication.

### 3. Monitoring & Scaling
- **HPA**: Horizontal Pod Autoscalers can be added to the Frontend and Backend services based on CPU/RAM usage.
- **Readiness/Liveness Probes**: Implement the `/health` endpoint in the backend for K8s to manage container lifecycle.

---
Build with love ❤️