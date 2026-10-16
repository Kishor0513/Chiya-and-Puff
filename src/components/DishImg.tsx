'use client';

import { useState } from 'react';
import { FOOD_FALLBACK } from '@/lib/foodImages';

interface DishImgProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

// Menu/thumbnail image that falls back to the house spread photo if the
// primary source fails to load, so a dish never shows a broken tile.
export default function DishImg({ src, alt, className, eager = false }: DishImgProps) {
  const [current, setCurrent] = useState(src);
  return (
    <img
      src={current}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      className={className}
      onError={() => {
        if (current !== FOOD_FALLBACK) setCurrent(FOOD_FALLBACK);
      }}
    />
  );
}
