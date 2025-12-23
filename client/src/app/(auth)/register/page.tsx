'use client';

import { ButtonCustom } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { InputCustom } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useRegisterMutation } from '@/hooks/apis/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp'
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { mutateAsync, isPending } = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await mutateAsync(data);
      toast.success('Đăng ký thành công!');

      setTimeout(() => router.replace('/login'), 1000);
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className='w-full bg-white p-8'>
      <div className='mb-8 text-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Đăng ký</h1>
        <p className='mt-2 text-sm text-gray-600'>Tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* NAME */}
        <Controller
          control={control}
          name='name'
          render={({ field }) => (
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='name'>
                <UserIcon className='h-4 w-4 text-gray-500' />
                Họ và tên
              </FieldLabel>
              <FieldContent>
                <InputCustom
                  {...field}
                  id='name'
                  placeholder='Nhập tên'
                  className={errors.name ? 'border-destructive' : ''}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />
        {/* EMAIL */}
        <Controller
          control={control}
          name='email'
          render={({ field }) => (
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='email'>
                <MailIcon className='h-4 w-4 text-gray-500' />
                Email
              </FieldLabel>
              <FieldContent>
                <InputCustom
                  {...field}
                  id='email'
                  placeholder='Nhập email'
                  className={errors.email ? 'border-destructive' : ''}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        {/* PHONE */}
        <Controller
          control={control}
          name='phone'
          render={({ field }) => (
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor='phone'>
                <PhoneIcon className='h-4 w-4 text-gray-500' />
                Số điện thoại
              </FieldLabel>
              <FieldContent>
                <InputCustom
                  {...field}
                  id='phone'
                  placeholder='Nhập số điện thoại'
                  className={errors.phone ? 'border-destructive' : ''}
                />
                <FieldError>{errors.phone?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        {/* PASSWORD */}
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

        {/* CONFIRM PASSWORD */}
        <Controller
          control={control}
          name='confirmPassword'
          render={({ field }) => (
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor='confirmPassword'>
                <LockIcon className='h-4 w-4 text-gray-500' />
                Xác nhận mật khẩu
              </FieldLabel>
              <FieldContent>
                <InputCustom
                  {...field}
                  id='confirmPassword'
                  type='password'
                  placeholder='Nhập lại mật khẩu'
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        {/* SUBMIT BUTTON */}
        <ButtonCustom type='submit' className='w-full' disabled={isSubmitting || isPending} size='lg'>
          {isSubmitting || isPending ? (
            <>
              <Spinner />
              Đang đăng ký...
            </>
          ) : (
            'Đăng ký'
          )}
        </ButtonCustom>

        <div className='text-center text-sm text-gray-600'>
          Đã có tài khoản?{' '}
          <Link href='/login' className='font-medium text-[#333] hover:underline'>
            Đăng nhập ngay
          </Link>
        </div>
      </form>
    </div>
  );
}
