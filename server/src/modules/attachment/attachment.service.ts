import { randomUUID } from 'crypto';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../../config/s3.js';
import { env } from '../../config/env.js';
import { Attachment, type IAttachment } from './attachment.model.js';
import { findMember, findById } from '../workspace/workspace.repository.js';
import { ApiError } from '../../utils/ApiError.js';

export async function uploadAttachment(
  file: Express.Multer.File,
  taskId: string,
  workspaceId: string,
  uploadedBy: string
): Promise<IAttachment> {
  const fileKey = `attachments/${workspaceId}/${taskId}/${randomUUID()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    })
  );

  const attachment = await Attachment.create({
    taskId,
    workspaceId,
    uploadedBy,
    fileName: file.originalname,
    fileKey,
    fileSize: file.size,
    mimeType: file.mimetype,
  });

  return attachment;
}

const PRESIGNED_URL_EXPIRES_IN = 900; // 15 minutes

export async function getPresignedUrl(
  attachmentId: string,
): Promise<{ url: string; expiresIn: number }> {
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) throw new ApiError(404, 'Attachment not found');

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: attachment.fileKey,
    }),
    { expiresIn: PRESIGNED_URL_EXPIRES_IN }
  );

  return { url, expiresIn: PRESIGNED_URL_EXPIRES_IN };
}

export async function getAttachments(
  taskId: string,
  workspaceId: string,
): Promise<IAttachment[]> {

  return Attachment.find({ taskId, workspaceId }).sort({ createdAt: -1 });
}

export async function deleteAttachment(
  attachmentId: string,
  workspaceId: string,
  requestingUserId: string
): Promise<void> {
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) throw new ApiError(404, 'Attachment not found');

  if (attachment.workspaceId.toString() !== workspaceId) {
    throw new ApiError(403, 'Access denied');
  }

  const workspace = await findById(workspaceId);
  if (!workspace) throw new ApiError(404, 'Workspace not found');
  const isUploader = attachment.uploadedBy.toString() === requestingUserId;
  const isOwner    = workspace!.owner.toString() === requestingUserId;

  if (!isUploader && !isOwner) {
    throw new ApiError(403, 'Only the uploader or workspace owner can delete this attachment');
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: attachment.fileKey,
    })
  );

  await attachment.deleteOne();
}
