// upload uses multer middleware before controller:

import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { upload } from "../../middlewares/upload.js";
import { validateBody } from "../../middlewares/validateBody.js";
import { uploadAttachmentSchema } from "./attachment.schema.js";
import { deleteAttachmentController, getAttachmentsController, getDownloadUrlController, uploadAttachmentController } from "./attachment.controller.js";

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['owner', 'member']),
  upload.single('file'),           // 'file' is the form field name
  validateBody(uploadAttachmentSchema),
  uploadAttachmentController
);

router.get('/', authenticate, authorize(['owner', 'member', 'viewer']), getAttachmentsController);
router.get('/:attachmentId/url', authenticate, authorize(['owner', 'member', 'viewer']), getDownloadUrlController);
router.delete('/:attachmentId', authenticate, authorize(['owner', 'member']), deleteAttachmentController);