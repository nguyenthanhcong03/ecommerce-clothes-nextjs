import { ButtonCustom } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Banner = () => {
  return (
    <section
      className='flex min-h-[750px] items-center justify-center bg-cover bg-center py-20 text-white'
      style={{ backgroundImage: `url(/images/banner-ecommerce.jpeg)` }}
    >
      <div className='container mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 text-center'>
        <Image
          src={'/images/outfitory-logo.png'}
          alt='Logo'
          height={150}
          width={300}
          className='transition-transform duration-300 hover:scale-125'
        />
        <div className='mx-5 mb-4 text-center leading-6 text-[#333]'>
          Hãy biến những ngày kỷ niệm của bạn trở nên đặc biệt hơn với vẻ đẹp tinh tế.
        </div>
        <Link href='/shop'>
          <ButtonCustom size='lg'>Khám phá ngay</ButtonCustom>
        </Link>
      </div>
    </section>
  );
};

export default Banner;
