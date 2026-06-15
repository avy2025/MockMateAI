const { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
  },
});

const bucketName = process.env.S3_BUCKET_NAME || 'mockmate-storage';

/**
 * Manually upload a buffer to S3
 */
async function uploadFile(fileBuffer, storageKey, mimetype) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
    Body: fileBuffer,
    ContentType: mimetype,
  });
  return await s3Client.send(command);
}

/**
 * Delete a file from S3
 */
async function deleteFile(storageKey) {
  if (!storageKey) return;
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
  });
  return await s3Client.send(command);
}

/**
 * Generate a pre-signed URL for secure file access (expires in 1hr by default)
 */
async function generateSignedUrl(storageKey, expiresIn = 3600) {
  if (!storageKey) return null;
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
}

module.exports = {
  s3Client,
  bucketName,
  uploadFile,
  deleteFile,
  getSignedUrl: generateSignedUrl,
};
