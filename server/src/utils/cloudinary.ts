import cloudinary from '@/config/cloudinary'

export const uploadImage = (buffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) return reject(error)
          return resolve(result)
        }
      )
      .end(buffer)
  })
}
export const uploadMultiple = async (files: Express.Multer.File[], folder: string) => {
  const uploads = files.map((file) => uploadImage(file.buffer, folder))
  return Promise.all(uploads)
}

export const uploadVideo = (buffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'video'
        },
        (error, result) => {
          if (error) return reject(error)
          return resolve(result)
        }
      )
      .end(buffer)
  })
}

export const deleteImage = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

export const deleteMultiple = async (publicIds: string[]) => {
  const deletions = publicIds.map((publicId) => deleteImage(publicId))
  return Promise.all(deletions)
}
