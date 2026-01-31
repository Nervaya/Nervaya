'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import loaderAnimation from './loader.json';

interface LottieLoaderProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const LottieLoader: React.FC<LottieLoaderProps> = ({ width = 300, height = 300, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div style={{ width, height }}>
        <Lottie animationData={loaderAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default LottieLoader;
