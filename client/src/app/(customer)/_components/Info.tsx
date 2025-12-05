import { Truck, MessageCircle, RefreshCcw, CreditCard } from 'lucide-react';
import Image from 'next/image';

export const POLICIES = [
  {
    icon: Truck,
    title: 'Miễn phí vận chuyển',
    subtitle: 'Đơn hàng từ 99.000đ'
  },
  {
    icon: RefreshCcw,
    title: 'Hoàn trả hàng',
    subtitle: 'Trong 14 ngày'
  },
  {
    icon: CreditCard,
    title: 'Thanh toán 100% an toàn',
    subtitle: 'Mua sắm an tâm'
  },
  {
    icon: MessageCircle,
    title: 'Hỗ trợ trực tuyến 24/7',
    subtitle: 'Giao hàng tận nhà'
  }
];

function Info() {
  return (
    <div className='mx-16 -mt-20 grid items-center justify-items-center bg-[#333] py-5 md:grid-cols-2 xl:grid-cols-4'>
      {POLICIES.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className='flex w-[280px] items-center justify-start gap-5 p-4'>
            <Icon strokeWidth={1} className='h-10 w-10 text-[#707070]' />
            <div className='items- flex flex-col justify-center'>
              <p className='text-lg font-medium text-white'>{item.title}</p>
              {item.subtitle && <p className='text-base text-[#D2D2D2]'>{item.subtitle}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Info;
