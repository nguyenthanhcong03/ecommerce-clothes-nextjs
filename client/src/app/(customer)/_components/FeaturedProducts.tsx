import Headline from '@/components/common/Headline';
import ProductCard from '@/components/common/ProductCard';
import { productService } from '@/services/productService';

const FeaturedProducts = async () => {
  const featuredProducts = await productService.getProducts();
  return (
    <section>
      <Headline text1='Sản phẩm nổi bật' text2='Được yêu thích nhất' />
      <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4'>
        {featuredProducts && featuredProducts.data.map((product) => <ProductCard key={product.id} item={product} />)}
      </div>
    </section>
  );
};

export default FeaturedProducts;
