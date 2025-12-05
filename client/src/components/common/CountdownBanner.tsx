import CountdownTimer from './CountdownTimer';

function CountdownBanner({ bannerImage = '/images/countdownBanner2.jpeg' }) {
  const targetDate = '2025-12-31T00:00:00';

  return (
    <div
      className='flex h-full w-full flex-col items-center justify-center gap-5 rounded-sm border bg-cover bg-center bg-no-repeat p-5'
      style={{
        backgroundImage: `url(${bannerImage})`
      }}
    >
      <div className='flex items-center justify-center gap-2.5'>
        <CountdownTimer targetDate={targetDate} />
      </div>
      <p className='text-center text-[28px] text-[#333]'>Phong cách cổ điển đang quay trở lại</p>
    </div>
  );
}

export default CountdownBanner;
