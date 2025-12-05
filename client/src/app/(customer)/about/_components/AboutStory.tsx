import Image from 'next/image';

interface AboutStoryProps {
  title: string;
  descriptions: string[];
  src: string;
}

export default function AboutStory({ title, descriptions, src }: AboutStoryProps) {
  return (
    <div className='mx-auto flex max-w-5xl flex-col items-center gap-8 p-5 text-center'>
      <div className='flex flex-col gap-8'>
        <h4 className='text-2xl font-semibold'>{title}</h4>
        <div className='flex flex-col gap-5 text-[clamp(12px,2vw,16px)]'>
          {descriptions.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </div>
      <div className='h-auto'>
        <Image src={src} alt={title} className='mx-auto' width={1000} height={400} />
      </div>
    </div>
  );
}
