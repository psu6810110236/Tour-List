const fs = require('fs');
const path = require('path');

// รับค่า Argument ว่าจะเอาโหมดไหน ('clean' หรือ 'mock')
const mode = process.argv[2]; 

// 📍 กำหนด Path ของไฟล์ (ปรับแก้ได้ถ้า db.json ของคุณอยู่ในโฟลเดอร์อื่น)
const dbPath = path.join(__dirname, 'db.json'); 
const emptySeedPath = path.join(__dirname, 'data', 'seeds', 'empty.json');
const mockSeedPath = path.join(__dirname, 'data', 'seeds', 'mock.json');

let sourcePath = '';

if (mode === 'clean') {
    sourcePath = emptySeedPath;
    console.log('🧹 กำลังล้างข้อมูล Database (Empty Data)...');
} else if (mode === 'mock') {
    sourcePath = mockSeedPath;
    console.log('📦 กำลังเพิ่มข้อมูลจำลองลง Database (Mock Data)...');
} else {
    console.error('❌ Error: กรุณาระบุโหมด "clean" หรือ "mock"');
    process.exit(1);
}

// ทำการคัดลอกไฟล์ Seed ไปทับ db.json
try {
    fs.copyFileSync(sourcePath, dbPath);
    console.log('✅ รีเซ็ตฐานข้อมูลสำเร็จเรียบร้อย!');
} catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการรีเซ็ตฐานข้อมูล:', err);
}