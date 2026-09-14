import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
};

export async function uploadImage(
  file: string, // base64 or URL
  folder: string = 'nizami'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'auto',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export async function uploadDocument(
  file: string,
  folder: string = 'nizami/documents'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'raw',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export default cloudinary;
