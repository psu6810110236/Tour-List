import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Multer } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto'; // 🟢 1. ดึง randomUUID จากระบบของ Node.js โดยตรง

@Controller('upload')
export class UploadController {
  @Post('slip')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Generate unique filename
          const uniqueSuffix = randomUUID(); // 🟢 2. เรียกใช้งานแทน uuidv4()
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept only image files
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadSlip(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Return the file URL that can be stored in database
    const fileUrl = `/uploads/${file.filename}`;
    
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: fileUrl,
    };
  }
}