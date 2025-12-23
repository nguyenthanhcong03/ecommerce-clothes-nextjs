import ProductImageGallery from '@/app/(customer)/product/[id]/_components/ProductImageGallery';
import ProductInfo from '@/app/(customer)/product/[id]/_components/ProductPrice';
import ProductReviews from '@/app/(customer)/product/[id]/_components/ProductReviews';
import ProductVariantSelector from '@/components/product/ProductVariantSelector';
import RelatedProducts from '@/app/(customer)/product/[id]/_components/RelatedProducts';
import { productService } from '@/services/productService';
import { Star } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

// Generate metadata
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await productService.getProductById(id);

  if (!product) {
    return {
      title: 'Sản phẩm không tồn tại',
      description: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'
    };
  }

  return {
    title: `${product.name} | Outfitory`,
    description: product.description || `Mua ${product.name} chất lượng cao tại Outfitory. Giá tốt nhất thị trường.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images:
        product.images?.map(({ url }) => ({
          url,
          alt: product.name
        })) || []
    }
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const [product, relatedProducts, productReviews] = await Promise.all([
    productService.getProductById(id),
    productService.getRelatedProducts(id),
    productService.getProductReviews(id)
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Breadcrumb */}
      <div className='border-b bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-4'>
          <nav className='text-sm text-gray-600'>
            <span>Trang chủ</span>
            <span className='mx-2'>/</span>
            <span>Sản phẩm</span>
            <span className='mx-2'>/</span>
            <span className='text-gray-900'>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Product Images */}
          <div className='space-y-4'>
            <ProductImageGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className='w-full p-2 md:p-4'>
            <div>
              <h1 className='text-xl font-normal sm:text-2xl'>{product.name}</h1>
              <div className='mt-2 flex items-center space-x-2'>
                <div className='flex items-center'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5' />
                  <span className='ml-1 text-xs text-gray-600 sm:text-sm'>
                    {product?.averageRating === 0 ? 'Chưa có đánh giá' : product?.averageRating?.toFixed(1)}
                  </span>
                </div>
                <span className='text-gray-300'>|</span>
                <span className='text-xs text-gray-600 sm:text-sm'>Đã bán: {product?.salesCount}</span>
              </div>
            </div>

            <ProductInfo product={product} />

            <div className='flex flex-col gap-2 p-2 sm:flex-row sm:p-4'>
              <h3 className='min-w-20 text-xs text-[#757575] sm:text-sm'>Vận chuyển</h3>
              <div className='text-xs sm:text-sm'>Nhận hàng sau 3 ngày</div>
            </div>

            <div className='flex flex-col gap-2 p-2 sm:flex-row sm:p-4'>
              <h3 className='min-w-20 text-xs text-[#757575] sm:text-sm'>An tâm mua sắm</h3>
              <div className='text-xs sm:text-sm'>7 ngày miễn phí trả hàng</div>
            </div>

            {/* Size và color */}
            <ProductVariantSelector product={product} />
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className='mb-8 rounded-lg bg-white p-6'>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>Mô tả sản phẩm</h2>
            <div className='prose max-w-none text-gray-700'>
              <p>{product.description}</p>
            </div>
          </div>
        )}

        {/* Product Reviews */}
        <div className='mb-8 rounded-lg bg-white p-6'>
          <ProductReviews productReviews={productReviews?.data} product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className='rounded-lg bg-white p-6'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900'>Sản phẩm liên quan</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}
