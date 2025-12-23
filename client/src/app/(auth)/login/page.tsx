'use client';

import { ButtonCustom } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { InputCustom } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useLoginMutation } from '@/hooks/apis/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(100, 'Email không được vượt quá 100 ký tự'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

export type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { mutateAsync: login, isPending, isSuccess } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  // Xử lý khi submit form
  const onSubmit = async (data: LoginInput) => {
    const { email, password } = data;

    try {
      const result = await login({ email, password });
      toast.success('Đăng nhập thành công!');

      // Lấy thông tin user từ kết quả đăng nhập
      const userRole = result?.user?.role;

      // Xác định đường dẫn điều hướng
      const redirectPath = userRole === 'admin' ? '/admin' : '/';

      router.replace(redirectPath);
    } catch {
      toast.error('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin đăng nhập.');
    }
  };

  return (
    <div className='w-full bg-white p-8'>
      <div className='mb-8 text-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Đăng nhập</h1>
        <p className='mt-2 text-sm text-gray-600'>Chào mừng bạn quay trở lại</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <Controller
          control={control}
          name='email'
          render={({ field }) => (
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='email'>
                <UserIcon className='h-4 w-4 text-gray-500' />
                Email
              </FieldLabel>
              <FieldContent>
                <InputCustom
                  {...field}
                  id='email'
                  type='text'
                  placeholder='Nhập email'
                  className={errors.email ? 'border-destructive' : ''}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name='password'
          render={({ field }) => (
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor='password'>
                <LockIcon className='h-4 w-4 text-gray-500' />
                Mật khẩu
              </FieldLabel>
              <FieldContent>
                <div className='relative'>
                  <InputCustom
                    {...field}
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Nhập mật khẩu'
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700'
                  >
                    {showPassword ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
                  </button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>{/* Có thể thêm Remember me checkbox ở đây nếu cần */}</div>
          <Link href='/forgot-password' className='text-sm text-[#333] hover:underline'>
            Quên mật khẩu?
          </Link>
        </div>

        <ButtonCustom type='submit' className='w-full' disabled={isSubmitting} size='lg'>
          {isSubmitting || isPending ? (
            <>
              <Spinner />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </ButtonCustom>

        <div className='text-center text-sm text-gray-600'>
          Chưa có tài khoản?{' '}
          <Link href='/register' className='font-medium text-[#333] hover:underline'>
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  );
}
