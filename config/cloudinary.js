'use strict';
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Supports either a single CLOUDINARY_URL or the three separate vars below.
// If CLOUDINARY_URL is set, the SDK reads it automatically from process.env.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const FOLDER = process.env.CLOUDINARY_FOLDER || 'rumedio-shop';

/**
 * Upload one express-fileupload file object (in-memory buffer) to Cloudinary.
 * Returns the secure_url string.
 */
async function uploadFile(file, subfolder = 'products') {
  const dataUri = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `${FOLDER}/${subfolder}`,
    resource_type: 'image'
  });
  return result.secure_url;
}

/** Upload one or many files (array or single file object). Returns array of secure_urls. */
async function uploadFiles(files, subfolder = 'products') {
  if (!files) return [];
  const arr = Array.isArray(files) ? files : [files];
  const urls = [];
  for (const file of arr) {
    urls.push(await uploadFile(file, subfolder));
  }
  return urls;
}

/** Delete an image from Cloudinary given its secure_url (or a previously-stored public_id). */
async function deleteByUrl(url) {
  try {
    // secure_url format: https://res.cloudinary.com/<cloud>/image/upload/v123456/folder/sub/name.ext
    const afterUpload = url.split('/upload/')[1];
    if (!afterUpload) return;
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
}

const isCloudinaryUrl = (str) => typeof str === 'string' && /^https?:\/\/res\.cloudinary\.com\//.test(str);

module.exports = { cloudinary, uploadFile, uploadFiles, deleteByUrl, isCloudinaryUrl };
