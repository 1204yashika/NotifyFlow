import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../taskApi';
import type { Task, Workspace } from '../../../types';
import { getMemberId, getMemberName } from '../../../types';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormError from '../../../components/ui/FormError';
import AttachmentList from '../../attachment/components/AttachmentList';

const schema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional().transform((val) => {
    if (!val) return undefined;
    return new Date(val).toISOString();
  }),
});

type FormInput = z.input<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspace: Workspace;
  task?: Task | null;
  isOwner: boolean;
}

const selectCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 bg-white text-gray-800 transition-all';
const labelCls  = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

export default function TaskModal({ isOpen, onClose, workspaceId, workspace, task, isOwner }: Props) {
  const isEdit = !!task;
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<FormInput>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo ?? undefined,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : undefined,
      });
    } else {
      reset({});
    }
  }, [task, reset]);

  const onSubmit = async (data: FormInput) => {
    try {
      if (isEdit) {
        await updateTask({ workspaceId, taskId: task!._id, data }).unwrap();
      } else {
        await createTask({ workspaceId, data }).unwrap();
      }
      reset();
      onClose();
    } catch (err: any) {
      setError('root', { message: err?.data?.message ?? 'Something went wrong' });
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask({ workspaceId, taskId: task._id }).unwrap();
      onClose();
    } catch {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormError message={errors.root?.message} />

        {/* Title */}
        <div className="flex flex-col">
          <label className={labelCls}>Title</label>
          <input
            placeholder="What needs to be done?"
            className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none transition-all bg-white
              focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10
              ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className={labelCls}>Description</label>
          <textarea
            rows={3}
            placeholder="Add more details..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 resize-none bg-white transition-all"
            {...register('description')}
          />
        </div>

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className={labelCls}>Priority</label>
            <select className={selectCls} {...register('priority')}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          {isEdit && (
            <div className="flex flex-col">
              <label className={labelCls}>Status</label>
              <select className={selectCls} {...register('status')}>
                <option value="todo">📋 Todo</option>
                <option value="in_progress">⚡ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          )}
        </div>

        {/* Assign to */}
        <div className="flex flex-col">
          <label className={labelCls}>Assign to</label>
          <select className={selectCls} {...register('assignedTo')}>
            <option value="">— Unassigned</option>
            {workspace.members.map((m) => (
              <option key={getMemberId(m)} value={getMemberId(m)}>
                {getMemberName(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Due date */}
        <div className="flex flex-col">
          <label className={labelCls}>Due date</label>
          <input
            type="date"
            className={selectCls}
            {...register('dueDate')}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-between pt-3 border-t border-gray-100 mt-1">
          {isEdit && (
            <Button type="button" variant="ghost" isLoading={deleting} onClick={handleDelete}
              className="text-red-500 hover:bg-red-50">
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={creating || updating}>
              {isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </div>
      </form>

      {/* Attachments */}
      {isEdit && task && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            📎 Attachments
          </p>
          <AttachmentList workspaceId={workspaceId} taskId={task._id} isOwner={isOwner} />
        </div>
      )}
    </Modal>
  );
}
