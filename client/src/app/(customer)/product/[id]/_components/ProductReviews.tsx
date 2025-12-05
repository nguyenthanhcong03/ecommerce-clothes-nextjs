'use client';

import { Product, Review } from '@/features/product/productType';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/ui/accordion';
import ReviewStatistics from './ReviewStatistics';
import ReviewList from './ReviewList';

interface ProductReviewsProps {
  product: Product;
  productReviews?: Review[];
}

export default function ProductReviews({ productReviews, product }: ProductReviewsProps) {
  return (
    <div className='mt-4 flex flex-col gap-2 rounded-sm bg-white p-4'>
      <Accordion type='single' defaultValue={'item-1'} collapsible>
        <AccordionItem value='item-1'>
          <AccordionTrigger className='text-primaryColor flex justify-between md:text-base'>
            ĐÁNH GIÁ SẢN PHẨM
          </AccordionTrigger>
          <AccordionContent className='text-secondaryColor text-sm md:text-base'>
            <div className='rounded bg-white p-3 sm:p-4'>
              <ReviewStatistics reviews={productReviews} product={product} />

              <div className='mt-6'>
                <ReviewList productReviews={productReviews} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
