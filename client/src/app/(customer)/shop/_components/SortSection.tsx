'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaginationResponse } from '@/features/auth/authType';
import { Product } from '@/features/product/productType';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type SortSectionProps = {
  pagination: PaginationResponse<Product>;
};

const SortSection = ({ pagination }: SortSectionProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const [sort, setSort] = useState<string>(params.get('sort') || '');
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString());

    if (!value || value === 'default') newParams.delete('sort');
    else newParams.set('sort', value);

    setSort(value);
    router.replace(`?${newParams.toString()}`);
  };

  return (
    <div className='mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white p-4 sm:flex-row sm:items-center'>
      <div className='text-sm text-gray-600'>
        <p>
          Hiển thị {(pagination?.data && pagination?.data.length) || 0} trên {pagination?.total || 0} sản phẩm
          {/* {currentCategory ? ` trong ${currentCategory.name}` : ''} */}
        </p>
      </div>

      <div className='flex items-center gap-4'>
        <div className='hidden items-center gap-2 lg:flex'>
          {/* <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md px-2 py-1 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
            aria-label='Grid view'
          >
            <Grid2X2 />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md px-2 py-1 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
            aria-label='List view'
          >
            <List />
          </button> */}
        </div>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Sắp xếp' />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value='default'>Mặc định</SelectItem>
            <SelectItem value='price-asc'>Giá tăng dần</SelectItem>
            <SelectItem value='price-desc'>Giá giảm dần</SelectItem>
            <SelectItem value='latest'>Mới nhất</SelectItem>
            <SelectItem value='popular'>Phổ biến</SelectItem>
            <SelectItem value='rating'>Đánh giá cao nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SortSection;
