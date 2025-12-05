import CountdownBanner from '@/components/common/CountdownBanner';
import { categoryService } from '@/features/category/categoryService';
import { findCategoryById } from '@/features/category/utils';
import { productService } from '@/features/product/productService';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { CategoryListSection } from '../_components/CategoryListSection';
import { FilterSection } from '../_components/FilterSection';
import ProductsList from '../_components/ProductsList';
import SortSection from '../_components/SortSection';
import Breadcrumb from '@/components/common/Breadcrumb';

const getAllProducts = async (query: string) => {
  try {
    const response = await productService.getAllProducts(query);
    return response;
  } catch (error) {
    console.error('Có lỗi xảy ra khi tải sản phẩm:', error);
  }
};

const getAllCategories = async () => {
  try {
    const response = await categoryService.getAllCategories();
    return response?.data;
  } catch (error) {
    console.error('Có lỗi xảy ra khi tải danh mục:', error);
  }
};

type Params = Promise<{ id?: string[] }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function OurShopPage(props: { params: Params; searchParams: SearchParams }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const _id = params.id?.[0] || null;
  const queryFilter = new URLSearchParams(searchParams as Record<string, string>).toString();
  const query = _id ? `category=${_id}&${queryFilter}` : queryFilter;
  const productResponse = await getAllProducts(query);
  const categories = await getAllCategories();
  const currentCategory = _id ? findCategoryById(categories || [], _id) : null;
  return (
    <div className='mx-auto max-w-7xl py-8'>
      <Breadcrumb items={[{ label: 'Cửa hàng', path: '/shop' }]} />
      <div className='flex w-full flex-col gap-6 lg:flex-row'>
        <div className='hidden lg:block lg:w-1/4'>
          <CategoryListSection categories={categories || []} currentCategory={currentCategory || undefined} />
          <FilterSection />
        </div>
        {/* Mobile Filter Sidebar */}
        <div className='lg:hidden'>
          <FilterSection />
        </div>
        {/* Main content */}
        <div className='lg:w-3/4'>
          {currentCategory ? (
            <div className='mb-4 flex items-center gap-2 rounded-md bg-white p-4'>
              <h1 className='text-2xl font-bold'>{currentCategory.name}</h1>
            </div>
          ) : (
            searchParams.search && (
              <div className='mb-4 text-center'>
                <h2 className='text-xl font-medium text-gray-600'>
                  Kết quả tìm kiếm cho &ldquo;{searchParams.search}&rdquo; - {productResponse?.total || 0} sản phẩm
                </h2>
              </div>
            )
          )}
          {!searchParams.search && (
            <div className='mb-4 h-[280px] w-full rounded-md bg-white p-4'>
              <CountdownBanner />
            </div>
          )}
          {!searchParams.search &&
            currentCategory &&
            currentCategory.children &&
            currentCategory?.children?.length > 0 && (
              <div className='mb-4 rounded-md bg-white p-4'>
                <h3>Khám phá theo danh mục</h3>
                <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                  {currentCategory.children.map((category) => (
                    <Link
                      key={category._id}
                      href={`/shop/${category._id}`}
                      className='flex flex-col items-center rounded-lg bg-white p-4 hover:opacity-90'
                    >
                      {category.images[0] && (
                        <Image
                          src={category.images[0]}
                          alt={category.name}
                          width={64}
                          height={64}
                          className='mb-3 h-16 w-16 object-contain'
                        />
                      )}
                      <h3 className='text-sm font-medium text-gray-900'>{category.name}</h3>
                      {category.productsCount > 0 && (
                        <span className='mt-1 text-xs text-gray-500'>{category.productsCount} sản phẩm</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          <SortSection pagination={productResponse!} />
          {/* Products */}
          <Suspense fallback={<p>Đang tải sản phẩm...</p>}>
            <ProductsList products={productResponse?.data || []} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
