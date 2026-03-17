# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code dan build TS
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine
WORKDIR /app

# Hanya install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Ambil hasil compile dari stage builder
COPY --from=builder /app/dist ./dist

# Ekspos port (sesuai k6 kamu tadi)
EXPOSE 8000

CMD ["node", "dist/index.js"]