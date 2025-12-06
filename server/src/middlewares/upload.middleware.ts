import multer from 'multer'
import { Request } from 'express'

// Cấu hình multer để lưu trữ file trong memory
const storage = multer.memoryStorage()

// File filter để chỉ cho phép upload ảnh và video
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Chấp nhận ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  }
  // Chấp nhận video
  else if (file.mimetype.startsWith('video/')) {
    cb(null, true)
  }
  // Từ chối các loại file khác
  else {
    cb(new Error('Only image and video files are allowed!'))
  }
}

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
})

export default upload
