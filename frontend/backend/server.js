require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tour = require('./src/models/Tour'); // นำเข้า Model ที่สร้างไว้

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json()); // ให้อ่าน JSON ได้
// สำคัญ: เปิดให้เข้าถึงโฟลเดอร์ uploads ผ่าน URL ได้ (เช่น http://localhost:5000/uploads/รูป.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. Database Connection ---
mongoose.connect('mongodb://127.0.0.1:27017/tour_db')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// --- 3. Multer Configuration (ตั้งค่าการอัปโหลดรูป) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        // เช็คว่ามีโฟลเดอร์ไหม ถ้าไม่มีให้สร้าง
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, 'uploads/'); // โฟลเดอร์ปลายทาง
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่กันซ้ำ: timestamp + ชื่อไฟล์เดิม
        // เช่น 170999999-myimage.jpg
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// --- 4. API Routes (CRUD) ---

// [GET] ดึงข้อมูลทัวร์ทั้งหมด
app.get('/api/tours', async (req, res) => {
    try {
        const tours = await Tour.find().sort({ createdAt: -1 }); // เรียงจากใหม่ไปเก่า
        res.json(tours);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [GET] ดึงข้อมูลทัวร์เดียว (ตาม ID)
app.get('/api/tours/:id', async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) return res.status(404).json({ message: "Tour not found" });
        res.json(tour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [POST] สร้างทัวร์ใหม่ + อัปโหลดรูป
// upload.single('image') -> 'image' คือชื่อ key ที่ Frontend ต้องส่งมา
app.post('/api/tours', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        
        // เช็คว่ามีการส่งไฟล์มาไหม ถ้ามีให้เก็บ path
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const newTour = new Tour({
            title,
            description,
            price,
            image: imageUrl
        });

        const savedTour = await newTour.save();
        res.status(201).json(savedTour);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// [PATCH] แก้ไขข้อมูลทัวร์
app.patch('/api/tours/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        let updateData = { title, description, price };

        // ถ้ามีการอัปรูปใหม่ ให้เปลี่ยน path รูป
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
            // (Option เสริม: ตรงนี้อาจเขียนโค้ดลบรูปเก่าทิ้งได้ด้วย fs.unlink)
        }

        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedTour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [DELETE] ลบทัวร์
app.delete('/api/tours/:id', async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        
        // ลบไฟล์รูปภาพออกจากเครื่องด้วย เพื่อไม่ให้รก
        if (tour && tour.image) {
            const imagePath = path.join(__dirname, tour.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Tour deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));