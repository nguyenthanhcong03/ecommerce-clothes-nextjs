'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  path?: string;
  label: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
}

export default function Breadcrumb({ items, separator, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();

  // Nếu không có items truyền vào, tạo breadcrumb từ URL
  const breadcrumbItems = items || generateBreadcrumbFromURL(pathname);

  return (
    <nav aria-label='Breadcrumb' className='mb-4'>
      <ol className='flex flex-wrap items-center gap-2 text-sm'>
        {showHome && (
          <>
            <li>
              <Link href='/' className='flex items-center text-gray-500 transition-colors hover:text-gray-900'>
                <Home size={16} className='mr-1' />
                <span>Trang chủ</span>
              </Link>
            </li>
            {breadcrumbItems.length > 0 && <li className='text-gray-400'>{separator || <ChevronRight size={16} />}</li>}
          </>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <li key={item.path || index} className='flex items-center'>
              {isLast ? (
                <span className='font-medium text-gray-900'>{item.label}</span>
              ) : (
                <>
                  <Link href={item.path || '#'} className='text-gray-500 transition-colors hover:text-gray-900'>
                    {item.label}
                  </Link>
                  <span className='mx-2 text-gray-400'>{separator || <ChevronRight size={16} />}</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Hàm tạo breadcrumb items từ URL
function generateBreadcrumbFromURL(pathname: string): BreadcrumbItem[] {
  const path = pathname.split('?')[0].split('#')[0];
  const pathSegments = path.split('/').filter(Boolean);

  if (pathSegments.length === 0) return [];

  return pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { path, label };
  });
}
