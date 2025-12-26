'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageGalleryProps {
  images: { url: string; publicId: string }[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className='flex aspect-square items-center justify-center rounded-lg bg-gray-200'>
        <span className='text-gray-400'>Không có hình ảnh</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className='space-y-4'>
      {/* Main Image */}
      <div className='group relative aspect-square overflow-hidden rounded-lg bg-gray-100'>
        <Image
          src={images[currentIndex].url}
          alt={`${productName} - Hình ${currentIndex + 1}`}
          fill
          sizes='100vw'
          className='object-cover'
          priority
        />

        {images.length > 1 && (
          <>
            <Button
              variant='outline'
              size='icon'
              className='absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white'
              onClick={prevImage}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <Button
              variant='outline'
              size='icon'
              className='absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white'
              onClick={nextImage}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className='grid grid-cols-4 gap-2'>
          {images.map((image, index) => (
            <button
              key={index}
              className={`aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors ${
                index === currentIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image.url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className='h-full w-full object-cover'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
