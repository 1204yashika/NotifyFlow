import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../taskApi';
import type { Task, Workspace } from '../../../types';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import FormError from '../../../components/ui/FormError';

const schema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional().transform((val) => {
	if (!val) return undefined;
	return new Date(val).toISOString(); // "2026-05-24" → "2026-05-24T00:00:00.000Z"
	}),
});

type FormInput = z.input<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspace: Workspace;
  task?: Task | null;   // if set → edit mode
}

export default function TaskModal({ isOpen, onClose, workspaceId, workspace, task }: Props) {
  const isEdit = !!task;
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<FormInput>({
    resolver: zodResolver(schema),
  });

  // populate form when editing
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
      setError('root', {
        message: err?.data?.message ?? 'Something went wrong',
      });
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormError message={errors.root?.message} />

        <Input
          label="Title"
          placeholder="Task title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            placeholder="Optional description"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#534AB7] resize-none"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#534AB7]"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#534AB7]"
                {...register('status')}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Assign to</label>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#534AB7]"
            {...register('assignedTo')}
          >
            <option value="">Unassigned</option>
            {workspace.members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.userId}</option>
            ))}
          </select>
        </div>

        <Input
          label="Due date"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <div className="flex gap-2 justify-between mt-2">
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              isLoading={deleting}
              onClick={handleDelete}
              className="text-red-500 hover:bg-red-50"
            >
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
    </Modal>
  );
}