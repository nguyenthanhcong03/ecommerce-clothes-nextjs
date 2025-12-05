import Breadcrumb from '@/components/common/Breadcrumb';
import Headline from '@/components/common/Headline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AboutStory from './_components/AboutStory';

export const cardData1 = {
  title: 'WHY WE DO',
  descriptions: [
    'Chúng ta sống trong một thế giới bị ám ảnh bởi việc hòa nhập, tuân theo các nguyên tắc và các khuôn mẫu của xã hội. Tại Outfitory, chúng tôi tin tưởng vào điều ngược lại - sự kết nối thực sự đến từ việc ôm lấy cá tính của bạn và từ chối những giới hạn. Đó là lý do tại sao chúng tôi tôn vinh sự đa dạng độc đáo của từng cá nhân tạo nên cộng đồng.',
    'Outfitory ra đời với mục đích đại diện cho những người muốn trở nên đích thực, tự hào với bản sắc độc đáo của bản thân. Chúng tôi tin vào việc phá vỡ ranh giới, thách thức kỳ vọng và tự tin thể hiện phong cách cá nhân của bạn.'
  ],
  src: '/images/imageAbout1.png'
};

export const cardData2 = {
  title: 'WHO WE ARE',
  descriptions: [
    'Outfitory là thương hiệu thời trang đường phố dẫn đầu xu hướng, nổi bật với phong cách thiết kế đơn giản, hiện đại, một sản phẩm tiêu chuẩn cao dành cho giới trẻ toàn cầu tự tin thể hiện cá tính.',
    'Outfitory không chỉ là một thương hiệu; đó là một phong trào. Một phong trào dành cho những người đam mê tự do biểu đạt, chân thật với chính mình và tự tin theo đuổi đam mê.',
    'Outfitory đề cao thẩm mỹ đô thị hiện đại, tôn vinh tính cá nhân đồng thời thúc đẩy ý thức kết nối cộng đồng. Chúng tôi tin rằng mỗi người đều có giá trị và câu chuyện riêng. Đó là việc yêu thương tất cả các khía cạnh của bản thân - độc đáo và bình thường.'
  ],
  src: '/images/imageAbout2.png'
};

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-7xl py-8'>
      <div className='my-5'>
        <Breadcrumb items={[{ label: 'Về chúng tôi', path: '/about' }]} />
      </div>

      <div className='my-8 rounded-md bg-white p-8'>
        <Headline text1='Tận tâm vì phong cách của bạn' text2='CHÀO MỪNG ĐẾN VỚI OUTFITORY' />
      </div>

      <div className='space-y-8 rounded-md bg-white p-8'>
        <AboutStory {...cardData1} />
        <AboutStory {...cardData2} />
      </div>

      <div className='my-8 rounded-md bg-white p-8'>
        <Headline text1='Chúng tôi luôn sẵn sàng hỗ trợ bạn' text2='Bạn có thắc mắc gì không?' />
        <div className='mx-auto my-8 max-w-[700px] space-y-4'>
          <Accordion type='single' collapsible defaultValue={'item-1'}>
            <AccordionItem value='item-1'>
              <AccordionTrigger>1. Làm thế nào để tôi đặt hàng trên website?</AccordionTrigger>
              <AccordionContent>
                Bạn chỉ cần chọn sản phẩm yêu thích, chọn kích cỡ và màu sắc, sau đó nhấn “Thêm vào giỏ hàng” và làm
                theo hướng dẫn thanh toán.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type='single' collapsible defaultValue={'item-1'}>
            <AccordionItem value='item-1'>
              <AccordionTrigger>2. Tôi có cần tạo tài khoản để mua hàng không?</AccordionTrigger>
              <AccordionContent>
                Không bắt buộc. Bạn có thể đặt hàng với tư cách khách. Tuy nhiên, tạo tài khoản giúp bạn theo dõi đơn
                hàng, lưu địa chỉ và nhận ưu đãi riêng.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type='single' collapsible defaultValue={'item-1'}>
            <AccordionItem value='item-1'>
              <AccordionTrigger>3. Tôi có thể đổi hoặc trả hàng không?</AccordionTrigger>
              <AccordionContent>
                Có. Bạn có thể đổi hoặc trả hàng trong vòng 7 ngày kể từ khi nhận được hàng nếu sản phẩm chưa qua sử
                dụng và còn nguyên tem, tag.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type='single' collapsible defaultValue={'item-1'}>
            <AccordionItem value='item-1'>
              <AccordionTrigger>4. Bao lâu tôi nhận được hàng sau khi đặt?</AccordionTrigger>
              <AccordionContent>
                Thời gian giao hàng thường từ 2–5 ngày làm việc tùy khu vực. Bạn sẽ nhận được mã vận đơn để theo dõi đơn
                hàng sau khi chúng tôi gửi đi.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type='single' collapsible defaultValue={'item-1'}>
            <AccordionItem value='item-1'>
              <AccordionTrigger>7. Phương thức thanh toán nào được chấp nhận?</AccordionTrigger>
              <AccordionContent>
                Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), và thanh toán qua ví điện tử VNPay.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type='single' collapsible defaultValue={'item-1'}>
            <AccordionItem value='item-1'>
              <AccordionTrigger>8. Làm sao để tôi kiểm tra tình trạng đơn hàng?</AccordionTrigger>
              <AccordionContent>
                Bạn có thể vào mục “Theo dõi đơn hàng” và nhập mã đơn hàng để xem trạng thái. Hoặc đăng nhập tài khoản
                để theo dõi tất cả đơn đã đặt.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
