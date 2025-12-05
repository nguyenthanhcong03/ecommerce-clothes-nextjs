import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
};

const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className='mx-auto max-w-7xl px-5'>{children}</div>;
};

export default Container;
