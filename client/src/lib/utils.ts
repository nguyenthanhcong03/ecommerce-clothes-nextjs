import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';

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
