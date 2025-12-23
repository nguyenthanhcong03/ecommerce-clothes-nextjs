'use client';

import { ROUTE } from '@/lib/config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavItems = [
  { name: 'Tổng quan', path: ROUTE.ADMIN.OVERVIEW, icon: '📊' },
  { name: 'Sản phẩm', path: ROUTE.ADMIN.PRODUCT_MANAGEMENT.ROOT, icon: '📦' },
  { name: 'Kho hàng', path: '/admin/inventory', icon: '📋' },
  { name: 'Người dùng', path: '/admin/users', icon: '👥' },
  { name: 'Đơn hàng', path: '/admin/orders', icon: '🛒' },
  { name: 'Thống kê', path: '/admin/analytics', icon: '📈' },
  { name: 'Cài đặt', path: '/admin/settings', icon: '⚙️' }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className='flex h-screen overflow-hidden bg-white'>
      {/* Admin Sidebar */}
      <div className='flex w-64 flex-col bg-gray-900 text-white'>
        {/* Logo */}
        <div className='border-b border-gray-700 p-6'>
          <Link href={`${ROUTE.ADMIN.OVERVIEW}`} className='flex items-center'>
            <div className='flex h-8 w-24 items-center justify-center rounded bg-blue-600'>
              <span className='text-sm font-bold text-white'>ADMIN</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto py-4'>
          <ul className='space-y-1 px-3'>
            {adminNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center rounded-lg px-3 py-3 text-sm transition-colors ${
                    isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className='mr-3 text-lg'>{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin User Info */}
        <div className='border-t border-gray-700 p-4'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-600'>
              <span className='text-sm'>👤</span>
            </div>
            <div>
              <p className='text-sm font-medium'>Admin User</p>
              <p className='text-xs text-gray-400'>admin@outfitory.com</p>
            </div>
          </div>
          <Link href='/' className='mt-3 block text-xs text-gray-400 transition-colors hover:text-white'>
            ← Về trang chủ
          </Link>
        </div>
      </div>

      {/* Admin Content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <header className='border-b border-gray-200 bg-white px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-semibold text-gray-900'>Admin Dashboard</h1>
            <div className='flex items-center space-x-4'>
              <button className='text-gray-500 hover:text-gray-700'>🔔</button>
              <button className='text-gray-500 hover:text-gray-700'>⚙️</button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto bg-gray-50 p-6'>{children}</main>
      </div>
    </div>
  );
}
