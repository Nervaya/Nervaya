'use client';

import React from 'react';
import { GlobalLoader, type GlobalLoaderProps } from '@/components/common/GlobalLoader';

export type LottieLoaderProps = GlobalLoaderProps;

export const LottieLoader: React.FC<LottieLoaderProps> = (props) => <GlobalLoader {...props} />;

export default LottieLoader;
