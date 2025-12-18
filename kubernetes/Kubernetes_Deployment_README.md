# 🚀 Kubernetes Deployment – 3-Tier Voting Application

This document covers **only the Kubernetes deployment** of the 3-tier Voting Application.

Architecture:
- **Frontend**: React (served via NGINX)
- **Backend**: Node.js + Express
- **Database**: MySQL with Persistent Storage
- **Platform**: Kubernetes (Kind / local cluster)

---

## 🏗 Architecture Overview

Browser
  ↓ NodePort
Frontend (NGINX)
  ├── /        → React UI
  └── /api/*   → Backend Service
                   ↓
                MySQL (PVC)

---

## 📁 Directory Structure

kubernetes/
├── namespace/
│   └── namespace.yaml
├── secrets/
│   ├── secrets.yaml
│   └── configmap.yaml
├── mysql/
│   ├── mysql-deployment.yaml
│   ├── mysql-service.yaml
│   ├── mysql-pvc.yaml
│   └── mysql-init-configmap.yaml
├── backend/
│   ├── backend-deployment.yaml
│   └── backend-service.yaml
└── frontend/
    ├── frontend-deployment.yaml
    └── frontend-service.yaml

---

## ✅ Prerequisites

- Kubernetes cluster (Kind / Minikube / EKS)
- kubectl configured
- Docker images already built and available

---

## 🚀 Deployment Steps

### 1️⃣ Create Namespace
kubectl apply -f namespace/namespace.yaml

### 2️⃣ Create Secrets & ConfigMaps
kubectl apply -f secrets/

### 3️⃣ Deploy MySQL
kubectl apply -f mysql/

### 4️⃣ Deploy Backend
kubectl apply -f backend/

### 5️⃣ Deploy Frontend
kubectl apply -f frontend/

---

## 🌐 Access the Application

kubectl get svc frontend-service -n vote-app

http://<NODE-IP>:<NODE-PORT>

---

## 🔐 Key Notes

- Frontend uses relative API paths
- NGINX handles backend routing
- Secrets managed via Kubernetes Secrets
- Persistent data via PVC

---

## 🔜 Next Steps

- Ingress configuration
- CI/CD pipeline
- DevSecOps integration
