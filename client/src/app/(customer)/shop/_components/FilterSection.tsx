'use client';

import { ButtonCustom } from '@/components/ui/button';
import { InputCustom } from '@/components/ui/input';
import { Star, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
type PriceRange = {
  label: string;
  min: number;
  max: number | null;
};
export const PRICE_RANGES: PriceRange[] = [
  { label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { label: '100.000đ - 300.000đ', min: 100000, max: 300000 },
  { label: '300.000đ - 500.000đ', min: 300000, max: 500000 },
  { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
  { label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
  { label: 'Trên 2.000.000đ', min: 2000000, max: null }
];

export function FilterSection() {
  const router = useRouter();
  const params = useSearchParams();
  const rating = params?.get('rating') || '';
  const minPrice = params?.get('minPrice') || '';
  const maxPrice = params?.get('maxPrice') || '';

  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState<number | null>(null);
  const [tempMaxPrice, setTempMaxPrice] = useState<number | null>(null);
  const [tempRating, setTempRating] = useState<string>(rating);

  const getFilterCount = () => {
    let count = 0;
    if (minPrice || maxPrice) count++;
    if (rating) count++;
    return count;
  };

  const caculateFilterCounter = () => {
    const count = getFilterCount();
    return count > 0 ? `(${count})` : '';
  };

  // Kiểm tra xem có đang sử dụng khoảng giá tùy chỉnh không
  const currentPriceRange = PRICE_RANGES.find(
    (range) => range.min.toString() === minPrice && (range.max ? range.max.toString() === maxPrice : !maxPrice)
  );

  const handleFilterChange = (name: string, value: PriceRange | string | number | null | undefined) => {
    const newParams = new URLSearchParams(params.toString());
    // Xử lý theo từng loại filter
    switch (name) {
      case 'priceRange': {
        // Xử lý khoảng giá định sẵn
        const priceRange = value as PriceRange | null;
        if (priceRange) {
          newParams.set('minPrice', priceRange.min.toString());
          if (priceRange.max) {
            newParams.set('maxPrice', priceRange.max.toString());
          } else {
            newParams.delete('maxPrice');
          }
        } else {
          newParams.delete('minPrice');
          newParams.delete('maxPrice');
        }
        break;
      }

      case 'minPrice':
      case 'maxPrice': {
        // Xử lý giá tùy chỉnh
        const strValue = value as string;
        if (strValue && strValue.trim() !== '') {
          newParams.set(name, strValue);
        } else {
          newParams.delete(name);
        }
        break;
      }

      case 'rating': {
        // Xử lý rating
        const numValue = value as number | string;
        if (numValue && Number(numValue) > 0) {
          newParams.set('rating', numValue.toString());
        } else {
          newParams.delete('rating');
        }
        break;
      }

      default: {
        // Xử lý chung cho các filter khác
        const strValue = value as string;
        if (strValue && strValue.trim() !== '') {
          newParams.set(name, strValue);
        } else {
          newParams.delete(name);
        }
        break;
      }
    }

    newParams.delete('page'); // Reset về trang 1 và xóa khỏi URL
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  const handleRatingChange = (ratingValue: string) => {
    if (rating === ratingValue) {
      // Nếu đang chọn rating này thì bỏ chọn
      setTempRating('');
      handleFilterChange('rating', '');
    } else {
      setTempRating(ratingValue);
      handleFilterChange('rating', ratingValue);
    }
  };

  const handlePriceRangeChange = (priceRange: PriceRange) => {
    if (currentPriceRange?.label === priceRange.label) {
      // Nếu đang chọn range này thì bỏ chọn
      handleFilterChange('priceRange', null);
    } else {
      // Chọn range mới
      handleFilterChange('priceRange', priceRange);
      setShowCustomPrice(false);
    }
  };
  const handleCustomPriceChange = (type: string, value: number) => {
    if (!value) return;
    if (type === 'minPrice') {
      setTempMinPrice(value);
    } else if (type === 'maxPrice') {
      setTempMaxPrice(value);
    }
  };
  const handleApplyCustomPrice = () => {
    if (tempMinPrice) {
      handleFilterChange('minPrice', tempMinPrice.toString());
    }
    if (tempMaxPrice) {
      handleFilterChange('maxPrice', tempMaxPrice.toString());
    }
    if (!tempMinPrice && !tempMaxPrice) {
      // Nếu cả 2 đều trống thì xóa filter giá
      handleFilterChange('priceRange', null);
    }
  };
  // Khởi tạo giá tùy chỉnh khi có giá từ URL params
  useEffect(() => {
    if (minPrice && !currentPriceRange) {
      setTempMinPrice(parseInt(minPrice));
      setShowCustomPrice(true);
    }
    if (maxPrice && !currentPriceRange) {
      setTempMaxPrice(parseInt(maxPrice));
      setShowCustomPrice(true);
    }
  }, [minPrice, maxPrice, currentPriceRange]);

  const handleShowCustomPrice = () => {
    if (showCustomPrice) {
      setShowCustomPrice(false);
      setTempMinPrice(null);
      setTempMaxPrice(null);
    } else {
      setShowCustomPrice(true);
    }

    // Reset khoảng giá định sẵn nếu có
    if (currentPriceRange) {
      handleFilterChange('priceRange', null);
    }
  };

  const handleResetFilter = () => {
    // Reset local state
    setShowCustomPrice(false);
    setTempMinPrice(null);
    setTempMaxPrice(null);
    setTempRating('');

    // Reset URL params - xóa tất cả filter params
    const newParams = new URLSearchParams(params.toString());

    // Danh sách các filter params cần xóa
    const filterParams = ['minPrice', 'maxPrice', 'rating'];

    filterParams.forEach((param) => {
      newParams.delete(param);
    });

    newParams.delete('page'); // Reset về trang 1

    // Navigate với params đã được reset
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  const handleClearFilter = (filterType: string) => {
    switch (filterType) {
      case 'price':
        handleFilterChange('priceRange', null);
        // Reset custom price
        setShowCustomPrice(false);
        setTempMinPrice(null);
        setTempMaxPrice(null);
        break;
      case 'rating':
        handleFilterChange('rating', null);
        setTempRating('');
        break;
      default:
        break;
    }
  };

  return (
    <div className={`rounded-md bg-white p-5`}>
      {/* Mobile close button */}
      <div className='mb-4 flex items-center justify-between lg:hidden'>
        <h2 className='text-lg font-semibold'>Bộ lọc</h2>
        <button className='rounded-full p-1 hover:bg-gray-100'>
          <X />
        </button>
      </div>
      {/* Filter title - desktop */}
      <div className='mb-4 hidden items-center justify-between lg:flex'>
        <h2 className='flex items-center text-lg font-semibold'>Bộ lọc sản phẩm {caculateFilterCounter()} </h2>
        {getFilterCount() > 0 && (
          <button
            onClick={handleResetFilter}
            className='rounded-sm px-2 py-1 text-sm text-gray-600 hover:bg-neutral-100'
          >
            Xóa
          </button>
        )}
      </div>
      {/* Price range */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Khoảng giá</h3>
          {(minPrice || maxPrice) && (
            <button className='text-xs text-gray-600 hover:text-[#333]' onClick={() => handleClearFilter('price')}>
              Bỏ chọn
            </button>
          )}
        </div>
        {/* Các mức giá định sẵn */}
        <div className='mb-4 flex flex-col gap-2'>
          {PRICE_RANGES.map((priceRange, index) => (
            <ButtonCustom
              key={index}
              onClick={() => handlePriceRangeChange(priceRange)}
              className={`flex items-center justify-between border px-3 py-2 text-left text-sm text-[#333] transition hover:bg-gray-50 ${
                currentPriceRange?.label === priceRange.label
                  ? 'border-[#333] bg-gray-100'
                  : 'border-gray-300 bg-white hover:border-[#333]'
              }`}
            >
              <span>{priceRange.label}</span>
              {currentPriceRange?.label === priceRange.label && <span className='text-[#333]'>✓</span>}
            </ButtonCustom>
          ))}

          {/* Tùy chỉnh giá */}
          <ButtonCustom
            onClick={handleShowCustomPrice}
            className={`flex items-center justify-between border px-3 py-2 text-left text-sm text-[#333] transition hover:bg-gray-50 ${
              showCustomPrice || (!currentPriceRange && (minPrice || maxPrice))
                ? 'border-[#333] bg-gray-100'
                : 'border-gray-300 bg-white hover:border-[#333]'
            }`}
          >
            <span>Tùy chỉnh</span>
            {(showCustomPrice || (!currentPriceRange && (minPrice || maxPrice))) && (
              <span className='text-[#333]'>✓</span>
            )}
          </ButtonCustom>
        </div>
        {/* Input tùy chỉnh giá */}
        {(showCustomPrice || (!currentPriceRange && (minPrice || maxPrice))) && (
          <div className='flex flex-col items-start space-y-3'>
            <div className='flex items-center gap-2'>
              <InputCustom
                type='number'
                value={tempMinPrice || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleCustomPriceChange('minPrice', parseInt(e.target.value))
                }
                placeholder='Từ'
                min='0'
              />
              <span className='text-gray-500'>-</span>
              <InputCustom
                type='number'
                value={tempMaxPrice || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleCustomPriceChange('maxPrice', parseInt(e.target.value))
                }
                placeholder='Đến'
                min='0'
              />
            </div>
            {tempMinPrice && tempMaxPrice && tempMinPrice > tempMaxPrice && (
              <p className='text-xs text-red-500'>Giá thấp nhất không được lớn hơn giá cao nhất</p>
            )}
            <ButtonCustom
              onClick={handleApplyCustomPrice}
              disabled={Boolean(tempMinPrice && tempMaxPrice && tempMinPrice > tempMaxPrice)}
              className='disabled:cursor-not-allowed disabled:opacity-50'
            >
              Áp dụng
            </ButtonCustom>
          </div>
        )}
      </div>
      {/* Rating */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Đánh giá</h3>
          {parseInt(tempRating) > 0 && (
            <button className='text-xs text-gray-600 hover:text-[#333]' onClick={() => handleClearFilter('rating')}>
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex gap-2'>
          {Array.from({ length: 5 }).map((_, index) => (
            <button
              key={index}
              className={`cursor-pointer ${index < parseInt(tempRating) ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => handleRatingChange((index + 1).toString())}
            >
              <Star />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
