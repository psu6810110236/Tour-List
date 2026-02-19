const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    price: { 
        type: Number, 
        required: true 
    },
    image: { 
        type: String, // เก็บชื่อไฟล์ หรือ path ของรูปภาพ
        default: ""
    }
}, { timestamps: true }); // เก็บเวลา created_at, updated_at อัตโนมัติ

module.exports = mongoose.model('Tour', TourSchema);