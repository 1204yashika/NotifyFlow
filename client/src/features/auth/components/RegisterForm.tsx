import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../authApi';
import { setCredentials } from '../authSlice';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { tokenStorage } from '../../../utils/tokenStorage';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import FormError from '../../../components/ui/FormError';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      const { accessToken, refreshToken } = res.data;
      tokenStorage.setRefresh(refreshToken);
      dispatch(setCredentials({ accessToken }));
      navigate('/dashboard');
    } catch (err: any) {
      setError('root', {
        message: err?.data?.message ?? 'Registration failed. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Create account</h1>
        <p className="text-sm text-gray-500 mt-1">Get started with NotifyFlow</p>
      </div>

      <FormError message={errors.root?.message} />

      <Input
        label="Name"
        placeholder="John Doe"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" isLoading={isLoading} className="w-full mt-2">
        Create account
      </Button>

      <p className="text-sm text-center text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="text-[#534AB7] font-medium hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}