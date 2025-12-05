'use client';
import { Category } from '@/features/category/categoryType';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CategoryItem = ({ category, selectedCategoryId }: { category: Category; selectedCategoryId?: string }) => {
  const router = useRouter();
  const isSelected = category._id === selectedCategoryId;

  return (
    <div
      className={`group flex items-center px-4 py-3 transition-colors duration-200 hover:bg-gray-50 ${
        isSelected ? 'border-r-2 border-blue-500 bg-gray-100' : ''
      } `}
    >
      <div className='flex flex-1 items-center'>
        <div
          className={`flex flex-1 cursor-pointer items-center gap-2 text-sm font-semibold transition-all duration-200 hover:text-blue-600`}
          onClick={() => router.replace(`/shop/${category._id}`)}
        >
          <Image
            src={category?.images[0]}
            alt={category?.name}
            width={40}
            height={60}
            className='rounded-md transition-transform duration-200 hover:scale-105'
          />
          <span className='transition-all duration-200 hover:translate-x-1 hover:underline'>{category?.name}</span>
        </div>
      </div>
    </div>
  );
};

export function CategoryListSection({
  breadcrumbItems = [],
  categories,
  currentCategory
}: {
  breadcrumbItems?: { label: string; path?: string }[];
  categories: Category[];
  currentCategory?: Category;
}) {
  const router = useRouter();

  const handleGoBack = () => {
    // Nếu có breadcrumb items và có ít nhất 2 items (Cửa hàng + current)
    if (breadcrumbItems.length >= 2) {
      const previousItem = breadcrumbItems[breadcrumbItems.length - 2];
      if (previousItem.path) {
        router.push(previousItem.path);
      } else {
        // Nếu không có path, trở về trang shop chính
        router.replace('/shop');
      }
    } else {
      // Mặc định trở về trang shop chính
      router.replace('/shop');
    }
  };

  return (
    <div>
      <div className='mb-6 overflow-hidden rounded-md bg-white'>
        <div className='p-4'>
          {currentCategory ? (
            <div className='flex items-center gap-2'>
              <ChevronLeft className='cursor-pointer transition-colors hover:text-blue-600' onClick={handleGoBack} />
              Trở về
            </div>
          ) : (
            <h2 className='text-lg font-medium'>Khám phá theo danh mục</h2>
          )}
        </div>
        {/* Render danh sách danh mục */}
        <div>
          {categories &&
            categories.map((category) => (
              <div className='border-t' key={category._id}>
                <CategoryItem category={category} selectedCategoryId={currentCategory?._id} />
              </div>
            ))}
        </div>
      </div>
      {/* )} */}
    </div>
  );
}
