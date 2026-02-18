# backend/Dockerfile

# 1. ใช้ Node.js v18 เป็นฐาน
FROM node:20-alpine

# 2. กำหนด Folder ทำงาน
WORKDIR /app

# 3. Copy ไฟล์ Package ไป Install ก่อน (เพื่อ Cache layer)
COPY package*.json ./
RUN npm install

# 4. Copy โค้ดทั้งหมด
COPY . .

# 5. Build โปรเจกต์
RUN npm run build

# 6. เปิด Port 3000
EXPOSE 3000

# 7. สั่งรัน Server
CMD ["npm", "run", "start:dev"]