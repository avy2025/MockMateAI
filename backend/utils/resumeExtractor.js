const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx'];

/**
 * Normalize extracted text: collapse whitespace, trim lines.
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')
    .trim();
}

/**
 * Extract readable text from a PDF buffer or file path.
 * @param {Buffer|string} source - File buffer or absolute path
 * @returns {Promise<string>}
 */
async function extractPdfText(source) {
  const buffer = Buffer.isBuffer(source)
    ? source
    : fs.readFileSync(source);

  const parser = new PDFParse({ data: buffer });

  try {
    const { text } = await parser.getText();
    return normalizeText(text || '');
  } finally {
    await parser.destroy();
  }
}

/**
 * Extract readable text from a DOCX buffer or file path.
 * @param {Buffer|string} source - File buffer or absolute path
 * @returns {Promise<string>}
 */
async function extractDocxText(source) {
  const options = Buffer.isBuffer(source)
    ? { buffer: source }
    : { path: source };

  const { value } = await mammoth.extractRawText(options);
  return normalizeText(value || '');
}

/**
 * Extract text from a resume file based on its extension.
 * @param {Buffer|string} source - Absolute path to uploaded file or File buffer
 * @param {string} [fileName] - Optional file name used to deduce extension if source is a buffer
 * @returns {Promise<string>}
 */
async function extractResumeText(source, fileName) {
  const nameToUse = fileName || (typeof source === 'string' ? source : '');
  const ext = path.extname(nameToUse).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    const error = new Error('Only PDF and DOCX files are supported.');
    error.code = 'INVALID_FILE_TYPE';
    throw error;
  }

  if (ext === '.pdf') {
    return extractPdfText(source);
  }

  return extractDocxText(source);
}

module.exports = {
  extractPdfText,
  extractDocxText,
  extractResumeText,
  normalizeText,
};
