import React from 'react';

type HeadlineProps = {
  text1: string;
  text2: string;
};

const Headline = ({ text1, text2 }: HeadlineProps) => {
  return (
    <div className='container mx-auto flex max-w-7xl flex-col items-center justify-center'>
      <span className='text-thirdColor text-sm uppercase'>{text1}</span>
      <h2 className='flex w-full items-center justify-center text-2xl leading-8 font-normal whitespace-nowrap text-[#333] uppercase before:mr-[50px] before:block before:h-1 before:w-full before:border-t-2 before:border-b-2 before:border-[#e1e1e1] before:content-[""] after:ml-[50px] after:block after:h-1 after:w-full after:border-t-2 after:border-b-2 after:border-[#e1e1e1] after:content-[""]'>
        {text2}
      </h2>
    </div>
  );
};

export default Headline;
