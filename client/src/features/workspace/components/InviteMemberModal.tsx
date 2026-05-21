import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInviteMemberMutation } from '../workspaceApi';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import FormError from '../../../components/ui/FormError';

const schema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['member', 'viewer']),
});

type FormInput = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export default function InviteMemberModal({ isOpen, onClose, workspaceId }: Props) {
  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'member' },
  });

  const onSubmit = async (data: FormInput) => {
    try {
      await inviteMember({ workspaceId, ...data }).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      setError('root', {
        message: err?.data?.message ?? 'Failed to invite member',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite member">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormError message={errors.root?.message} />
        <Input
          label="Email address"
          type="email"
          placeholder="colleague@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#534AB7]"
            {...register('role')}
          >
            <option value="member">Member — can create and edit tasks</option>
            <option value="viewer">Viewer — can only view tasks</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Send invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}