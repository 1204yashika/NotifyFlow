import { useRef, useState } from 'react';
import { tokenStorage } from '../../../utils/tokenStorage';
import Button from '../../../components/ui/Button';

interface Props {
workspaceId: string;
taskId: string;
onUploaded: () => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function FileUpload({ workspaceId, taskId, onUploaded }: Props) {
const inputRef = useRef<HTMLInputElement>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [dragOver, setDragOver] = useState(false);

const uploadFile = async (file: File) => {
// validate type
if (!ALLOWED_TYPES.includes(file.type)) {
	setError('File type not allowed. Use JPEG, PNG, PDF or TXT.');
	return;
}

// validate size
if (file.size > MAX_SIZE) {
	setError('File too large. Maximum size is 5MB.');
	return;
}

setError(null);
setIsLoading(true);

try {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('taskId', taskId);

	const token = tokenStorage.getAccess();

	const res = await fetch(
	`/api/v1/workspaces/${workspaceId}/attachments`,
	{
		method: 'POST',
		headers: {
		Authorization: `Bearer ${token}`,
		// don't set Content-Type — browser sets it with boundary for multipart
		},
		body: formData,
	}
	);

	if (!res.ok) {
	const data = await res.json();
	throw new Error(data.message ?? 'Upload failed');
	}

	onUploaded(); // trigger refetch
} catch (err: any) {
	setError(err.message ?? 'Upload failed');
} finally {
	setIsLoading(false);
}
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (file) uploadFile(file);
};

const handleDrop = (e: React.DragEvent) => {
e.preventDefault();
setDragOver(false);
const file = e.dataTransfer.files?.[0];
if (file) uploadFile(file);
};

return (
<div className="flex flex-col gap-2">
	<div
	onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
	onDragLeave={() => setDragOver(false)}
	onDrop={handleDrop}
	onClick={() => inputRef.current?.click()}
	className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
		${dragOver
		? 'border-[#534AB7] bg-[#EEEDFE]'
		: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
	>
	<p className="text-sm text-gray-500">
		{isLoading ? 'Uploading...' : 'Drop file here or click to upload'}
	</p>
	<p className="text-xs text-gray-400 mt-1">
		JPEG, PNG, PDF, TXT up to 5MB
	</p>
	<input
		ref={inputRef}
		type="file"
		className="hidden"
		accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
		onChange={handleFileChange}
	/>
	</div>

	{error && (
	<p className="text-xs text-red-500">{error}</p>
	)}
</div>
);
}