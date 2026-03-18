# backend/Dockerfile

# ── Stage 1: Build ────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Production runtime ───────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# ติดตั้งเฉพาะ production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# คัดลอก compiled JS จาก stage 1
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# ใช้ start:prod (node dist/main) แทน start:dev (nest start --watch)
CMD ["npm", "run", "start:prod"]
