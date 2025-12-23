'use client';
import { Product } from '@/types/productType';
import { formatCurrency } from '@/lib/utils';
// import { useProductPrice } from '@/hooks/useProductPrice';
import { Eye, Star } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  item: Product;
  isShowVariant?: boolean;
  isShowActionButtons?: boolean;
  useVariantContext?: boolean; // Flag để sử dụng context hoặc không
};

function ProductCard({ item, isShowActionButtons = true, useVariantContext = false }: ProductCardProps) {
  const router = useRouter();

  // Sử dụng Zustand store nếu được yêu cầu
  // const productPrice = useProductPrice(item);

  // Lấy giá hiển thị
  // const displayPrice = useVariantContext
  //   ? productPrice
  //   : (() => {
  //       // Lấy variant có giá thấp nhất làm mặc định
  //       const defaultVariant = item.variants.reduce((min, variant) =>
  //         !min || variant.price < min.price ? variant : min
  //       );

  //       return {
  //         price: defaultVariant.price,
  //         originalPrice: defaultVariant.originalPrice
  //       };
  //     })();
  const displayPrice = {
    price: 100000,
    originalPrice: 150000
  };

  // Hàm xử lý sự kiện khi nhấn nút "Mua ngay"
  const handleBuyNow = () => {
    // Hiển thị modal chi tiết sản phẩm hoặc thực hiện hành động mua ngay
  };

  // Hàm navigate đến trang chi tiết sản phẩm
  const handleNavigateToDetail = () => {
    router.push(`/product/${item.id}`);
  };

  return (
    <>
      <div className='flex h-full w-full flex-col items-start justify-start overflow-hidden rounded-md border bg-white transition-all duration-300 hover:opacity-95 hover:shadow-xl'>
        <div className='group relative max-h-[340px] w-full cursor-pointer'>
          <div onClick={handleNavigateToDetail}>
            {item.images && item.images.length > 0 ? (
              <>
                <Image
                  className='max-h-[340px] w-full object-cover'
                  width={340}
                  height={500}
                  src={item?.images[0]?.url}
                  alt={item?.name}
                />
                <Image
                  width={340}
                  height={500}
                  className='absolute top-0 right-0 bottom-0 left-0 max-h-[340px] w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-300'
                  alt={item?.name}
                  src={item?.images[1]?.url || item?.images[0].url}
                />
              </>
            ) : (
              <div className='flex h-[340px] w-full items-center justify-center bg-gray-200 text-gray-500'>
                No Image Available
              </div>
            )}
          </div>

          {isShowActionButtons && (
            <div className='absolute bottom-0 left-1/2 flex -translate-x-1/2 transform flex-col gap-2 bg-transparent opacity-0 transition-all duration-300 group-hover:bottom-3 group-hover:opacity-100 group-hover:transition-all group-hover:duration-300'>
              <button
                onClick={handleBuyNow}
                className='flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white hover:bg-[#333] hover:text-white'
              >
                <Eye strokeWidth={1.5} width={20} />
              </button>
            </div>
          )}
        </div>
        <div className={`flex h-full w-full flex-col items-start justify-between p-2 sm:px-3`}>
          {/* Color Selection */}
          {/* {isShowVariant && (
            <div className='flex w-full justify-center gap-1'>
              {variantOptions.colors.map((color) => {
                return (
                  <button key={color} className='h-[25px] w-[25px] rounded-full border p-0.5 text-[10px] sm:text-xs'>
                    {COLOR_OPTIONS.map(
                      (option) =>
                        option.name === color && (
                          <div
                            key={option.name}
                            className='h-full w-full rounded-full border'
                            style={{ backgroundColor: option.hex }}
                          ></div>
                        )
                    )}
                  </button>
                );
              })}
            </div>
          )} */}
          <div
            className='mt-1 line-clamp-2 w-full cursor-pointer text-sm text-[#333] md:text-base'
            onClick={handleNavigateToDetail}
          >
            {item?.name}
          </div>

          {/* Rating section */}
          <div className='mt-1 flex items-center gap-1'>
            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4' />
            <span className='text-[10px] text-gray-600 sm:text-xs'>
              {item?.averageRating === 0 ? 'Chưa có đánh giá' : item?.averageRating?.toFixed(1)}
            </span>
          </div>

          <div className='flex w-full justify-between'>
            {/* Hiển thị giá */}
            <div className='text-secondaryColor my-1 text-[10px] font-normal sm:my-2 sm:text-sm'>
              <span className='font-medium'>{formatCurrency(displayPrice.price || 0)}</span>
              {displayPrice.originalPrice && (
                <span className='ml-2 text-gray-400 line-through'>
                  {formatCurrency(displayPrice.originalPrice || 0)}
                </span>
              )}
            </div>

            {/* Lượt bán section */}
            <div className='mt-1 flex items-center gap-1 text-[10px] sm:text-xs'>
              <span className='text-secondaryColor'>Đã bán</span>
              <span className='text-gray-600'>{item?.salesCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCard;
