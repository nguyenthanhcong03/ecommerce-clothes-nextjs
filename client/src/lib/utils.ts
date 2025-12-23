import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import { Review, Variant } from '@/types/productType';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Xóa đi ký tự `/` đầu tiên của path
 */
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path;
};

export const formatCurrency = (amount?: number) => {
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: Date | string, format = 'DD/MM/YYYY') => {
  if (!date) return '';

  try {
    return dayjs(date).format(format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Hàm tìm variant dựa trên size và color
export const findVariant = (variants: Variant[], size: string, color: string) =>
  variants.find((v) => v.size === size && v.color === color);

// Hàm lấy giá hiển thị dựa trên variant đã chọn hoặc mặc định
export const getSelectedPrice = (variants: Variant[], selectedVariant: Variant | null) => {
  if (selectedVariant) {
    return {
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice
    };
  }

  // Lấy variant có giá thấp nhất làm mặc định
  const defaultVariant = variants.reduce((min, variant) => (!min || variant.price < min.price ? variant : min));

  return {
    price: defaultVariant.price,
    originalPrice: defaultVariant.originalPrice
  };
};

// Thống kê đánh giá
export const calculateReviewStatistics = (reviews: Review[]) => {
  const counts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 sao
  if (!reviews.length) return counts;

  reviews.forEach((review) => {
    const rating = review.rating; // Làm tròn xuống để lấy giá trị nguyên
    if (rating >= 1 && rating <= 5) {
      counts[5 - rating]++; // Đếm số lượng đánh giá cho mỗi sao theo index
    }
  });

  return counts;
};
