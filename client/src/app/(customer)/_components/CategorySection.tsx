import Headline from '@/components/common/Headline';
import { categoryService } from '@/services/categoryService';
import { Category } from '@/types/categoryType';
import Image from 'next/image';
import Link from 'next/link';

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop/${category.id}`}
      className='flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md'
    >
      {category.image && (
        <Image src={category.image} alt={category.name} width={64} height={64} className='mb-3 object-contain' />
      )}
      <h3 className='text-sm font-medium text-gray-900'>{category.name}</h3>
      {category.productsCount > 0 && (
        <span className='mt-1 text-xs text-gray-500'>{category.productsCount} sản phẩm</span>
      )}
    </Link>
  );
}

export default async function CategorySection() {
  const categoryResponse = await categoryService.getCategories();
  // if (treeLoading) {
  //   return (
  //     <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
  //       {[...Array(6)].map((_, index) => (
  //         <div key={index} className='animate-pulse'>
  //           <div className='rounded-lg bg-gray-200 p-4'>
  //             <div className='mx-auto mb-3 h-16 w-16 rounded-full bg-gray-300'></div>
  //             <div className='mx-auto h-4 w-3/4 rounded bg-gray-300'></div>
  //             <div className='mx-auto mt-2 h-3 w-1/2 rounded bg-gray-300'></div>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  return (
    <section>
      <Headline text1='Khám phá' text2='Danh mục nổi bật' />

      <div className='mt-6 flex justify-center gap-4 rounded-md'>
        {categoryResponse?.data &&
          categoryResponse.data.map((category) => <CategoryCard key={category.id} category={category} />)}
      </div>
    </section>
  );
}
