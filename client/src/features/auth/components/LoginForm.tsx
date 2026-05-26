import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../authApi';
import { setCredentials } from '../authSlice';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { tokenStorage } from '../../../utils/tokenStorage';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import FormError from '../../../components/ui/FormError';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await login(data).unwrap();
      const { accessToken, refreshToken } = res.data;

      tokenStorage.setRefresh(refreshToken);
      dispatch(setCredentials({ accessToken }));
      navigate('/dashboard');
    } catch (err: any) {
      setError('root', {
        message: err?.data?.message ?? 'Login failed. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      <FormError message={errors.root?.message} />

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

      <Button type="submit" isLoading={isLoading} className="w-full mt-2">
        Sign in
      </Button>

      <p className="text-sm text-center text-gray-500">
        Don't have an account?{' '}
        <a href="/register" className="text-[#534AB7] font-medium hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}