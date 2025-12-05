import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md px-4 text-center'>
        <div className='mb-8'>
          <div className='mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200'>
            <ShoppingBag className='h-12 w-12 text-gray-400' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Không tìm thấy sản phẩm</h1>
          <p className='mb-8 text-gray-600'>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        </div>

        <div className='space-y-4'>
          <Button asChild className='w-full'>
            <Link href='/shop'>
              <ShoppingBag className='mr-2 h-4 w-4' />
              Xem tất cả sản phẩm
            </Link>
          </Button>

          <Button variant='outline' asChild className='w-full'>
            <Link href='/'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Về trang chủ
            </Link>
          </Button>
        </div>

        <div className='mt-8 text-sm text-gray-500'>
          <p>
            Cần hỗ trợ?{' '}
            <Link href='/contact' className='text-blue-600 hover:underline'>
              Liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
