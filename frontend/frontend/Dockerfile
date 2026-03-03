# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# ลง Package
COPY package*.json ./
RUN npm install

# ก๊อปปี้โค้ด
COPY . .

# เปิด Port ของ Vite
EXPOSE 5173

# สั่งรัน Dev Mode พร้อมเปิด --host เพื่อให้ Docker คุยกับเครื่องเราได้
CMD ["npm", "run", "dev", "--", "--host"]