'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/authStore';
import { useLogoutMutation } from '@/features/auth/useAuth';
import { CircleUserRound, LogOut, Settings, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function HeaderAuthSection() {
  const { user, isAuthenticated } = useAuthStore();
  const { mutateAsync } = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await mutateAsync();
      toast.success('Đăng xuất thành công');
    } catch (error) {
      toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className='flex items-center space-x-4'>
      {isAuthenticated && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className='bg-blue-600 text-white'>
                  {user.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm leading-none font-medium'>{user.username}</p>
                <p className='text-muted-foreground text-xs leading-none'>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/profile' className='cursor-pointer'>
                <User className='mr-2 h-4 w-4' />
                <span>Hồ sơ</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/orders' className='cursor-pointer'>
                <ShoppingBag className='mr-2 h-4 w-4' />
                <span>Đơn hàng</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings' className='cursor-pointer'>
                <Settings className='mr-2 h-4 w-4' />
                <span>Cài đặt</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href={'/login'} className='flex items-center gap-2'>
          <CircleUserRound />
          Đăng nhập
        </Link>
      )}
    </div>
  );
}
