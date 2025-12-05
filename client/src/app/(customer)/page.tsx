import Link from 'next/link';
import Banner from './_components/Banner';
import CategorySection from './_components/CategorySection';
import FeaturedProducts from './_components/FeaturedProducts';
import Info from './_components/Info';
import Container from '@/components/common/Container';

export default function CustomerHomePage() {
  return (
    <div>
      {/* Banner Section */}
      <Banner />
      <Info />
      {/* Content Container */}
      <Container>
        <div className='space-y-12 py-12'>
          {/* Featured Categories */}
          <CategorySection />

          {/* Featured Products */}
          <FeaturedProducts />
        </div>
      </Container>

      {/* Sale Section */}
      <section className='bg-red-600 py-16 text-white'>
        <div className='container mx-auto max-w-7xl px-5 text-center'>
          <h2 className='mb-4 text-3xl font-bold'>Ưu đãi đặc biệt</h2>
          <p className='mb-8 text-xl'>Giảm giá lên đến 50% cho các sản phẩm chọn lọc</p>
          <Link
            href='/shop'
            className='inline-block rounded-lg bg-white px-8 py-3 font-semibold text-red-600 transition-colors hover:bg-gray-100'
          >
            Xem ưu đãi
          </Link>
        </div>
      </section>
    </div>
  );
}
