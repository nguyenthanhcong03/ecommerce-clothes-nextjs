import Headline from '@/components/common/Headline';
import ProductCard from '@/components/common/ProductCard';
import { productService } from '@/features/product/productService';

const FeaturedProducts = async () => {
  const featuredProducts = await productService.getFeaturedProducts();
  return (
    <section>
      <Headline text1='Sản phẩm nổi bật' text2='Được yêu thích nhất' />
      <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4'>
        {featuredProducts && featuredProducts.map((product) => <ProductCard key={product._id} item={product} />)}
      </div>
    </section>
  );
};

export default FeaturedProducts;
