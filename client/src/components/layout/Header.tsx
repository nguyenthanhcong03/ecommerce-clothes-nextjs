import { Menu, Search, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MenuItem from '../common/MenuItem';
import HeaderActions from './HeaderAuthSection';

export default function Header() {
  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 h-14 bg-white/90 shadow-sm backdrop-blur-sm duration-200 ease-in lg:h-20`}
    >
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-5'>
        {/* Mobile Menu Button */}
        <div className='flex items-center lg:hidden'>
          <Menu fontSize={26} cursor={'pointer'} />
        </div>

        {/* Logo - Centered on mobile, left on desktop */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:ml-4 lg:translate-x-0 lg:translate-y-0'>
          <Link href={'/'} className='flex items-center'>
            <Image
              src='/images/outfitory-logo.png'
              alt='Logo'
              height={80}
              width={160}
              className='transition-transform duration-300 hover:scale-105'
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className='ml-auto lg:ml-8'>
          <div className='hidden lg:flex lg:gap-10'>
            <MenuItem href='/' text='Trang chủ' exact />
            <MenuItem href='/shop' text='Sản phẩm' />
            <MenuItem href='/news' text='Tin tức' />
            <MenuItem href='/contact' text='Liên hệ' />
            <MenuItem href='/about' text='Về chúng tôi' />
          </div>
        </nav>

        {/* Actions */}
        <div className='flex items-center gap-4'>
          {/* Search mobile */}
          <Search
            className='lg:hidden'
            fontSize={20}
            cursor={'pointer'}
            // onClick={() => handleToggleSideBar('search')}
          />
          {/* Search Desktop */}
          <Search
            className='hidden lg:block'
            fontSize={20}
            cursor={'pointer'}
            // onClick={() => handleToggleSearchModal()}
          />

          {/*  Cart, Account  */}

          <div
            className='relative cursor-pointer'
            // onClick={() => {
            //   handleToggleSideBar('cart');
            // }}
          >
            <ShoppingCart />
            {/* {totalCartItems >= 1 && (
              <div className='bg-[#333] absolute bottom-3 left-3 h-5 w-5 rounded-full text-center text-xs leading-5 text-white'>
                {totalCartItems}
              </div>
            )} */}
          </div>

          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
