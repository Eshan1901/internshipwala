/**
 * Multer Upload Configuration
 *
 * Configures disk storage for all file uploads.
 * Naming convention (from Backend-Architecture.md Section 10.2):
 *   {fieldname}_{uuid}_{timestamp}.{ext}
 *   e.g. profile_a1b2c3d4_1719500000000.jpg
 *
 * Storage directories (from Section 10.1):
 *   uploads/profiles/     — profile photos
 *   uploads/projects/     — student project submissions
 *   uploads/assignments/  — assignment file submissions
 *   uploads/certificates/ — certificate PDFs (placeholder in v1)
 *
 * File size limits (from Section 10 and env.js):
 *   Profile photo: 2 MB (MAX_PROFILE_PHOTO_SIZE_MB)
 *   Project/assignment: 10 MB (MAX_PROJECT_FILE_SIZE_MB)
 */

import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env.js';
import { AppError } from '../utils/AppError.js';

// ── Storage engines ───────────────────────────────────────────────────────────

const storage = multer.memoryStorage();

// ── File Filters ──────────────────────────────────────────────────────────────

/**
 * File filter for profile photos — JPEG and PNG only.
 * From Backend-Architecture.md Section 10.4 and Section 9.8.
 */
const profilePhotoFilter = (_req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png'];
  const allowedExt = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMime.includes(file.mimetype) || !allowedExt.includes(ext)) {
    return cb(new AppError(400, 'Only JPEG and PNG image files are allowed.'));
  }
  return cb(null, true);
};

/**
 * File filter for project and assignment submissions.
 * From Backend-Architecture.md Section 9.8:
 *   application/pdf, application/zip, .docx, image/jpeg, image/png
 */
const projectFileFilter = (_req, file, cb) => {
  const allowedMime = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];
  const allowedExt = ['.pdf', '.zip', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMime.includes(file.mimetype) || !allowedExt.includes(ext)) {
    return cb(new AppError(400, 'Allowed file types: PDF, ZIP, DOCX, JPEG, PNG.'));
  }
  return cb(null, true);
};

// ── Multer instances ──────────────────────────────────────────────────────────

const MB = 1024 * 1024;

/** Multer instance for profile photo uploads */
export const profilePhotoUpload = multer({
  storage,
  fileFilter: profilePhotoFilter,
  limits: { fileSize: env.MAX_PROFILE_PHOTO_SIZE_MB * MB },
});

/** Multer instance for project file uploads */
export const projectFileUpload = multer({
  storage,
  fileFilter: projectFileFilter,
  limits: { fileSize: env.MAX_PROJECT_FILE_SIZE_MB * MB },
});

/** Multer instance for assignment file uploads */
export const assignmentFileUpload = multer({
  storage,
  fileFilter: projectFileFilter,
  limits: { fileSize: env.MAX_PROJECT_FILE_SIZE_MB * MB },
});
