# ---------- Production Image ----------
FROM node:18-alpine

WORKDIR /app

# Copy only dependency files first (layer caching)
COPY package*.json ./

# Install only production deps
RUN npm ci --only=production

# Copy source code
COPY . .

# Drop root privileges
USER node

EXPOSE 5000

CMD ["node", "server.js"]
