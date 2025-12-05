'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Review } from '@/features/product/productType';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { memo, useState } from 'react';

type ReviewListProps = {
  productReviews?: Review[];
};

const ReviewList = ({ productReviews }: ReviewListProps) => {
  const [filter, setFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'

  const handlePageChange = (page) => {
    // dispatch(setPage(page));
  };

  const handleLimitChange = (current, size) => {
    // dispatch(setLimit(size));
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    // dispatch(setPage(1)); // Reset to first page when filter changes
  };

  const renderRatingFilters = () => {
    const filters = ['all', '5', '4', '3', '2', '1'];

    return (
      <div className='mb-8 flex flex-wrap gap-2'>
        {filters.map((value) => (
          <button
            key={value}
            onClick={() => handleFilterChange(value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === value ? 'bg-[#333] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {value === 'all' ? 'Tất cả' : `${value} sao`}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className='mt-4'>
      {renderRatingFilters()}
      <div>
        {productReviews &&
          productReviews.map((review) => (
            <div key={review._id} className='border-b pb-4'>
              <div className='flex items-start gap-3'>
                <Avatar>
                  <AvatarImage src={review.userId.avatar} alt='@shadcn' />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center'>
                    <h4 className='text-sm font-medium'>
                      {review.userId?.lastName + ' ' + review.userId?.firstName || 'Người dùng ẩn danh'}
                    </h4>
                    <span className='ml-2 text-xs text-gray-400'>
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true, // khoảng 1 giờ trước
                        locale: vi
                      })}
                    </span>
                  </div>

                  <div className='mt-1'>{/* <Rate disabled value={review.rating} size={16} /> */}</div>

                  <p className='mt-1 text-sm whitespace-pre-line text-gray-700'>{review?.comment}</p>

                  {review.reply && (
                    <div className='mt-3 rounded-md bg-gray-50 p-3'>
                      <p className='text-xs font-medium text-gray-500'>Phản hồi từ Cửa hàng:</p>
                      <p className='mt-1 text-sm'>{review.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* {pagination.total > pagination.limit && (
        <div className='mt-6 flex justify-center'>
          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            onChange={handlePageChange}
            onShowSizeChange={handleLimitChange}
            showSizeChanger
            pageSizeOptions={['5', '10', '20']}
          />
        </div>
      )} */}
    </div>
  );
};

export default memo(ReviewList);
