import React, { useEffect, useState } from 'react';
import SplashOne from './SplashOne';
import SplashTwo from './SplashTwo';
import SplashThree from './SplashThree';

type Props = {
  onFinish: () => void;
};

export default function SplashContainer({ onFinish }: Props) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStep(2);
    }, 1000);

    const timer2 = setTimeout(() => {
      setStep(3);
    }, 2000);

    const timer3 = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  if (step === 1) return <SplashOne />;
  if (step === 2) return <SplashTwo />;

  return <SplashThree />;
}