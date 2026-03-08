'use client';

import React from 'react';
import GlobalLoader, { type GlobalLoaderProps } from '@/components/common/GlobalLoader';

type LottieLoaderProps = GlobalLoaderProps;

const LottieLoader: React.FC<LottieLoaderProps> = (props) => <GlobalLoader {...props} />;

export default LottieLoader;
