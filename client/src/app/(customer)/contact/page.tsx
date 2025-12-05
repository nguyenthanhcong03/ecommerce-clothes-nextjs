import Breadcrumb from '@/components/common/Breadcrumb';
import { ButtonCustom } from '@/components/ui/button';
import { InputCustom } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

function ContactForm() {
  return (
    <div className='p-5 md:w-7/12 md:p-12'>
      <h4 className='text-2xl'>Gửi lời nhắn cho chúng tôi</h4>
      <hr className='my-5' />
      <div className='flex flex-col gap-5'>
        <div className='flex flex-col gap-5 sm:flex-row'>
          <InputCustom placeholder='Họ và tên' name='name' className='flex-1' />
          <InputCustom placeholder='Email' name='email' className='flex-1' />
        </div>
        <Textarea placeholder='Ghi chú' className='h-40 rounded-xs' />
        <ButtonCustom className='mt-2 self-start'>Gửi</ButtonCustom>
      </div>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className='p-5 md:w-5/12 md:border-r md:border-gray-200 md:p-12'>
      <h4 className='text-2xl'>Thông tin liên hệ</h4>
      <hr className='my-5' />
      <div className='flex flex-col gap-5 text-gray-700'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <MapPin size={20} />
            <span>Địa chỉ</span>
          </div>
          <p className='text-gray-500'>Số XX Thanh Bình, Phường Mỗ Lao, Quận Hà Đông, TP. Hà Nội</p>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Phone size={20} />
            <span>Số điện thoại</span>
          </div>
          <p className='text-gray-500'>037.370.2309</p>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Mail size={20} />
            <span>Email</span>
          </div>
          <p className='break-words text-gray-500'>nguyenthanhcong03@hotmail.com</p>
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Clock size={20} />
            <span>Giờ mở cửa</span>
          </div>
          <p className='text-gray-500'>Mỗi ngày từ 9:00 AM đến 22:00 PM</p>
        </div>

        <div className='mt-2 flex gap-3'>
          <a href='https://www.facebook.com/nguyenthanhcong03' target='_blank'>
            <Facebook size={30} />
          </a>
          <a href='https://www.instagram.com/nguyenthanhcong03' target='_blank'>
            <Instagram size={30} />
          </a>
        </div>
      </div>
    </div>
  );
}

function ContactMap() {
  return (
    <iframe
      title='Google Maps'
      src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6329237372715!2d105.82215547503077!3d21.007346580636508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac8109765ba5%3A0xd84740ece05680ee!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUaOG7p3kgbOG7o2k!5e0!3m2!1svi!2s!4v1738651086553!5m2!1svi!2s'
      width='100%'
      height='100%'
      style={{ border: 0 }}
      allowFullScreen
      loading='lazy'
      referrerPolicy='no-referrer-when-downgrade'
    />
  );
}

export default function ContactPage() {
  return (
    <div className='mx-auto max-w-7xl py-8'>
      <div className='my-5'>
        <Breadcrumb items={[{ label: 'Liên hệ', path: '/contact' }]} />
      </div>

      <div className='mx-auto h-[450px] w-full rounded-md bg-white p-4'>
        <ContactMap />
      </div>

      <div className='mx-auto mt-6 flex w-full flex-col gap-10 rounded-md border border-gray-200 bg-white md:flex-row md:gap-0'>
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
}
