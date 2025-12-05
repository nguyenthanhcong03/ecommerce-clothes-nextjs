'use client';
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
}

type TimeLeft = {
  Days: number;
  Hours: number;
  Mins: number;
  Secs: number;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const calculateTimeLeft = (): Partial<TimeLeft> => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) return {};

    return {
      Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      Mins: Math.floor((difference / 1000 / 60) % 60),
      Secs: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState<Partial<TimeLeft>>(calculateTimeLeft());

  const translates: Record<keyof TimeLeft, string> = {
    Days: 'Ngày',
    Hours: 'Giờ',
    Mins: 'Phút',
    Secs: 'Giây'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatNumber = (number: number | undefined) => {
    return number !== undefined ? String(number).padStart(2, '0') : '00';
  };

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    const key = interval as keyof TimeLeft;
    const value = timeLeft[key];

    if (value === undefined) return null;

    return (
      <span key={key} className='rounded border border-[#E1E1E1] bg-white p-2 text-center'>
        {formatNumber(value)} <span className='text-secondaryColor text-sm'>{translates[key]}</span>
      </span>
    );
  });

  return <>{timerComponents}</>;
};

export default CountdownTimer;
