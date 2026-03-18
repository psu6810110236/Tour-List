# frontend/Dockerfile

# ── Stage 1: Build React app ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# รับ build arg แล้วตั้งเป็น env ให้ Vite อ่านตอน build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────
FROM nginx:1.25-alpine

# คัดลอก static files จาก stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# คัดลอก nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
