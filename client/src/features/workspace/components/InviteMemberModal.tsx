import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInviteMemberMutation } from '../workspaceApi';
import Modal from '../../../components/ui/Modal';
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

const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';
const selectCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 bg-white text-gray-800 transition-all';

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
      setError('root', { message: err?.data?.message ?? 'Failed to invite member' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite member">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-[#EEEDFE] rounded-lg px-4 py-3">
          <span className="text-lg mt-0.5">👋</span>
          <p className="text-sm text-[#534AB7]">
            Invite a teammate to collaborate in this workspace.
          </p>
        </div>

        <FormError message={errors.root?.message} />

        {/* Email */}
        <div className="flex flex-col">
          <label className={labelCls}>Email address</label>
          <input
            type="email"
            placeholder="colleague@example.com"
            className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none transition-all bg-white
              focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10
              ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label className={labelCls}>Role</label>
          <div className="flex flex-col gap-2">
            {[
              { value: 'member', title: 'Member', desc: 'Can create, edit and manage tasks', icon: '✏️' },
              { value: 'viewer', title: 'Viewer', desc: 'Can only view tasks and workspace', icon: '👁️' },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer
                  hover:border-[#534AB7]/40 hover:bg-[#FAFAFE] transition-all has-[:checked]:border-[#534AB7] has-[:checked]:bg-[#EEEDFE]/50"
              >
                <input type="radio" value={opt.value} className="mt-0.5 accent-[#534AB7]" {...register('role')} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{opt.icon} {opt.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 mt-1">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Send invite</Button>
        </div>
      </form>
    </Modal>
  );
}
