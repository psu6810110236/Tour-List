import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
  @Post('slip')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Generate unique filename
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          // ✅ แก้ 1: ใส่ Backtick ( ` ) ครอบ Template String
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept only image files
        // ✅ แก้ 2: แก้ Regex ไม่ให้กลายเป็นคอมเมนต์ (เปลี่ยนจาก // เป็น /\/ )
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
  // ✅ แก้ 3: เปลี่ยนจาก Multer.File เป็น Express.Multer.File
  async uploadSlip(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Return the file URL that can be stored in database
    // ✅ แก้ 4: ใส่ Backtick ( ` ) ครอบ Template String
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