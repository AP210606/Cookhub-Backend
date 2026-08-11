# ==================== BACKEND DOCKERFILE ====================
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
# or "npm start" if defined in package.json