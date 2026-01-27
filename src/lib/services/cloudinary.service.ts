import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_FOLDERS } from '../constants/app.constants';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: CLOUDINARY_FOLDERS.ROOT }, (error, result) => {
      if (error) {
        reject(error);
      } else if (result) {
        resolve(result.secure_url);
      } else {
        reject(new Error('Upload failed'));
      }
    });
    uploadStream.end(fileBuffer);
  });
};
