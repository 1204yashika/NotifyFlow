import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  uploadAttachment,
  getAttachments,
  getPresignedUrl,
  deleteAttachment,
} from './attachment.service.js';

export async function uploadAttachmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const attachment = await uploadAttachment(
      req.file!,
      req.body.taskId,
      req.params['workspaceId'] as string,
      req.user!.userId
    );
    res.status(201).json(new ApiResponse(201, 'Attachment uploaded', attachment));
  } catch (err) {
    next(err);
  }
}

export async function getAttachmentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const attachments = await getAttachments(
      req.query['taskId'] as string,
      req.params['workspaceId'] as string,
    );
    res.status(200).json(new ApiResponse(200, 'Attachments fetched', attachments));
  } catch (err) {
    next(err);
  }
}

export async function getDownloadUrlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getPresignedUrl(
      req.params['attachmentId'] as string,
    );
    res.status(200).json(new ApiResponse(200, 'Download URL generated', result));
  } catch (err) {
    next(err);
  }
}

export async function deleteAttachmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await deleteAttachment(
      req.params['attachmentId'] as string,
      req.params['workspaceId'] as string,
      req.user!.userId
    );
    res.status(200).json(new ApiResponse(200, 'Attachment deleted', null));
  } catch (err) {
    next(err);
  }
}
