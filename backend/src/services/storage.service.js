import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import logger from '../logger/logger.js';

// Resolve project root for local disk path calculation
const PROJECT_ROOT = path.resolve();

// ── Cloudinary Configuration ──────────────────────────────────────────────────
const hasCloudinary = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary Storage Provider activated');
}

// ── S3 Configuration ──────────────────────────────────────────────────────────
const hasS3 = !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET);
let s3Client = null;
if (hasS3) {
  const s3Config = {
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  };
  if (env.AWS_S3_ENDPOINT) {
    s3Config.endpoint = env.AWS_S3_ENDPOINT;
    // For services like Cloudflare R2 or Supabase
    s3Config.forcePathStyle = true;
  }
  s3Client = new S3Client(s3Config);
  logger.info('S3 Storage Provider activated');
}

export const storageService = {
  /**
   * Upload a file buffer to the configured storage provider.
   *
   * @param {Buffer} buffer - File buffer from multer
   * @param {string} originalName - Original name of the uploaded file
   * @param {string} mimeType - File mimetype
   * @param {string} subDir - Subdirectory/Folder name (e.g. 'profiles', 'projects')
   * @returns {Promise<string>} Web-accessible file URL/path
   */
  async uploadFile(buffer, originalName, mimeType, subDir) {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueName = `${subDir}_${uuidv4()}_${Date.now()}${ext}`;

    // 1. Cloudinary Provider (Images only)
    if (hasCloudinary && mimeType.startsWith('image/')) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `internshipwala/${subDir}`,
            public_id: path.parse(uniqueName).name,
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              return reject(new Error('Failed to upload image to Cloudinary.'));
            }
            return resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });
    }

    // 2. S3 Provider (Default for documents, or fallback if Cloudinary is not configured)
    if (hasS3) {
      const key = `internshipwala/${subDir}/${uniqueName}`;
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            ACL: 'public-read',
          })
        );
        // If an endpoint is customized, construct the URL accordingly, otherwise construct standard AWS S3 URL
        const baseUrl = env.AWS_S3_ENDPOINT
          ? `${env.AWS_S3_ENDPOINT}/${env.AWS_S3_BUCKET}`
          : `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
        return `${baseUrl}/${key}`;
      } catch (error) {
        logger.error('S3 upload error:', error);
        throw new Error('Failed to upload file to Cloud Storage.');
      }
    }

    // 3. Local Storage Fallback
    const targetDir = path.join(PROJECT_ROOT, env.UPLOAD_DIR, subDir);
    try {
      // Ensure local folder exists
      await fs.mkdir(targetDir, { recursive: true });
      const targetPath = path.join(targetDir, uniqueName);
      await fs.writeFile(targetPath, buffer);
      
      // Return root-relative path for server serving static content
      return `/uploads/${subDir}/${uniqueName}`;
    } catch (error) {
      logger.error('Local file write error:', error);
      throw new Error('Failed to save file locally.');
    }
  },

  /**
   * Delete a file from the configured storage provider.
   *
   * @param {string} fileUrlOrPath - Web URL or relative file path
   * @returns {Promise<void>}
   */
  async deleteFile(fileUrlOrPath) {
    if (!fileUrlOrPath) return;

    // 1. Cloudinary URL
    if (fileUrlOrPath.includes('cloudinary.com')) {
      try {
        // Extract public ID from URL (e.g. /internshipwala/profiles/name)
        const parts = fileUrlOrPath.split('/');
        const folderIndex = parts.indexOf('internshipwala');
        if (folderIndex !== -1) {
          const publicIdWithExt = parts.slice(folderIndex).join('/');
          const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
          await cloudinary.uploader.destroy(publicId);
          logger.info('Deleted file from Cloudinary', { publicId });
        }
      } catch (error) {
        logger.error('Cloudinary deletion error:', error);
      }
      return;
    }

    // 2. S3 URL
    if (hasS3 && (fileUrlOrPath.includes('amazonaws.com') || (env.AWS_S3_ENDPOINT && fileUrlOrPath.includes(env.AWS_S3_ENDPOINT)))) {
      try {
        // Extract S3 key
        const keyIndex = fileUrlOrPath.indexOf('internshipwala/');
        if (keyIndex !== -1) {
          const key = fileUrlOrPath.substring(keyIndex);
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: env.AWS_S3_BUCKET,
              Key: key,
            })
          );
          logger.info('Deleted file from S3', { key });
        }
      } catch (error) {
        logger.error('S3 deletion error:', error);
      }
      return;
    }

    // 3. Local file path (e.g. /uploads/profiles/filename.jpg)
    if (fileUrlOrPath.startsWith('/uploads/')) {
      try {
        const relativePath = fileUrlOrPath.substring('/uploads/'.length); // e.g. profiles/filename.jpg
        const absolutePath = path.join(PROJECT_ROOT, env.UPLOAD_DIR, relativePath);
        await fs.unlink(absolutePath);
        logger.info('Deleted local file', { path: absolutePath });
      } catch (error) {
        // If file doesn't exist, ignore
        if (error.code !== 'ENOENT') {
          logger.error('Local file deletion error:', error);
        }
      }
    }
  },
};
