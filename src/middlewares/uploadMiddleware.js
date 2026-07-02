/**
 * Upload Middleware — Field Wrappers
 *
 * Exports named Multer middleware for each upload type.
 * Routes import and apply the relevant export directly.
 *
 * From Backend-Architecture.md Section 7.7:
 *
 *   Upload          | Field Name        | Types           | Max Size
 *   --------------- | ----------------- | --------------- | --------
 *   Profile photo   | profile_photo     | JPEG, PNG       | 2 MB
 *   Project file    | project_file      | PDF,ZIP,DOCX,   | 10 MB
 *                   |                   | JPEG, PNG       |
 *   Assignment file | assignment_file   | PDF,ZIP,DOCX,   | 10 MB
 *                   |                   | JPEG, PNG       |
 *
 * Usage in routes:
 *   router.post('/profile/photo', uploadProfilePhoto, asyncHandler(controller.uploadPhoto));
 */

import { profilePhotoUpload, projectFileUpload, assignmentFileUpload } from '../config/upload.js';

/**
 * Multer middleware for single profile photo.
 * Field name: 'profile_photo'
 */
export const uploadProfilePhoto = profilePhotoUpload.single('profile_photo');

/**
 * Multer middleware for single project file.
 * Field name: 'project_file'
 */
export const uploadProjectFile = projectFileUpload.single('project_file');

/**
 * Multer middleware for single assignment file.
 * Field name: 'assignment_file'
 */
export const uploadAssignmentFile = assignmentFileUpload.single('assignment_file');
