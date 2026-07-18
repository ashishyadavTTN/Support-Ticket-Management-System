const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Attachment } = require('../models');

const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');

function getTicketUploadDir(ticketId) {
  return path.join(UPLOAD_ROOT, 'tickets', String(ticketId));
}

function ensureTicketUploadDir(ticketId) {
  const dir = getTicketUploadDir(ticketId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getAttachmentFilePath(ticketId, storedName) {
  return path.join(getTicketUploadDir(ticketId), storedName);
}

async function saveAttachments(files, { ticketId, commentId, uploadedBy }) {
  if (!files?.length) {
    return [];
  }

  const dir = ensureTicketUploadDir(ticketId);
  const records = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const storedName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(dir, storedName);

    await fs.promises.writeFile(filePath, file.buffer);

    const attachment = await Attachment.create({
      ticketId,
      commentId: commentId ?? null,
      uploadedBy,
      originalName: file.originalname,
      storedName,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    records.push(attachment);
  }

  return records;
}

module.exports = {
  UPLOAD_ROOT,
  getAttachmentFilePath,
  saveAttachments,
};
