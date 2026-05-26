import { useGetAttachmentsQuery, useGetDownloadUrlMutation, useDeleteAttachmentMutation } from '../attachmentApi';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { selectCurrentUser } from '../../auth/authSlice';
import FileUpload from './FileUpload';

interface Props {
  workspaceId: string;
  taskId: string;
  isOwner: boolean;
}

const FILE_ICONS: Record<string, string> = {
  'application/pdf':  '📄',
  'image/jpeg':       '🖼️',
  'image/png':        '🖼️',
  'image/webp':       '🖼️',
  'text/plain':       '📝',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ workspaceId, taskId, isOwner }: Props) {
  const user = useAppSelector(selectCurrentUser);
  const { data, refetch } = useGetAttachmentsQuery({ workspaceId, taskId }, { skip: !workspaceId || !taskId });
  const [getUrl] = useGetDownloadUrlMutation();
  const [deleteAttachment, { isLoading: deleting }] = useDeleteAttachmentMutation();

  const attachments = data?.data ?? [];

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const res = await getUrl({ workspaceId, attachmentId }).unwrap();
      // open presigned URL in new tab
      window.open(res.data.url, '_blank');
    } catch {
      alert('Failed to get download URL');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      await deleteAttachment({ workspaceId, attachmentId, taskId }).unwrap();
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      <FileUpload
        workspaceId={workspaceId}
        taskId={taskId}
        onUploaded={refetch}
      />

      {attachments.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          {attachments.map((att) => {
            const canDelete = isOwner || att.uploadedBy === user?._id;
            const icon = FILE_ICONS[att.mimeType] ?? '📎';

            return (
              <div
                key={att._id}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <span className="text-base">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate font-medium">
                    {att.fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatSize(att.fileSize)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(att._id, att.fileName)}
                  className="text-xs text-[#534AB7] hover:underline flex-shrink-0"
                >
                  Download
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(att._id)}
                    className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                    disabled={deleting}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {attachments.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          No attachments yet
        </p>
      )}
    </div>
  );
}