import React, { memo } from 'react';
import { Star, Stars } from 'lucide-react';
import { Product, Review } from '@/features/product/productType';
import { calculateReviewStatistics } from '@/features/product/utils';

type ReviewStatisticsProps = {
  reviews?: Review[];
  product: Product;
};

const ReviewStatistics = ({ reviews = [], product }: ReviewStatisticsProps) => {
  const statistics = calculateReviewStatistics(reviews);

  // Tính phần trăm cho mỗi sao
  const percentages = statistics.map((count) =>
    product?.totalReviews ? Math.round((count / product?.totalReviews) * 100) : 0
  );

  return (
    <div className='flex flex-col gap-6 rounded-lg bg-white p-4 shadow-sm md:flex-row'>
      <div className='flex shrink-0 flex-col items-center justify-center'>
        <span className='text-3xl font-bold text-gray-800'>{product?.averageRating}</span>
        {/* <Stars disabled allowHalf value={product?.averageRating} className='my-2 text-sm text-amber-400' /> */}
        <span className='text-sm text-gray-500'>{product?.totalReviews} đánh giá</span>
      </div>

      <div className='flex-1'>
        {[5, 4, 3, 2, 1].map((star, index) => (
          <div key={star} className='mb-1 flex items-center'>
            <div className='flex w-16 items-center'>
              <span className='mr-1 text-xs'>{star}</span>
              <Star fill='#FBBF24' strokeWidth={0} size={16} />
            </div>
            {/* <Progress
              percent={percentages[index]}
              size='small'
              strokeColor='#FBBF24'
              className='flex-1'
              format={(percent) => `${percent}%`}
            /> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ReviewStatistics);
