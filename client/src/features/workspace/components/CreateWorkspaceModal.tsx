import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWorkspaceMutation } from '../workspaceApi';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setActiveWorkspace } from '../workspaceSlice';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import FormError from '../../../components/ui/FormError';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  description: z.string().max(200).optional(),
});

type FormInput = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateWorkspaceModal({ isOpen, onClose }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [createWorkspace, { isLoading }] = useCreateWorkspaceMutation();

  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<FormInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormInput) => {
    try {
      const res = await createWorkspace(data).unwrap();
      dispatch(setActiveWorkspace(res.data._id));
      navigate(`/workspace/${res.data._id}`);
      reset();
      onClose();
    } catch (err: any) {
      setError('root', {
        message: err?.data?.message ?? 'Failed to create workspace',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormError message={errors.root?.message} />
        <Input
          label="Workspace name"
          placeholder="e.g. Engineering"
          error={errors.name?.message}
          {...register('name')}
          id="workspace-name"
        />
        <Input
          label="Description (optional)"
          placeholder="What is this workspace for?"
          error={errors.description?.message}
          {...register('description')}
          id="description"
        />
        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}