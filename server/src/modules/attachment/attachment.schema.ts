import z from "zod";

export const uploadAttachmentSchema = z.object({
  taskId: z.string().min(1),
});
// file itself comes from multer, not req.body