import React, { useEffect, useState } from 'react';

interface PictureArtProps {
  artKey: string;
  label: string;
  colorHex?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VOCAB_IMAGE_KEYS = new Set<string>([
  'airplane',
  'apple',
  'ball',
  'banana',
  'barley',
  'basket',
  'bear',
  'bird',
  'boat',
  'book',
  'bull',
  'bus',
  'camel',
  'car',
  'carrot',
  'cat',
  'cow',
  'deer',
  'dog',
  'drum',
  'duck',
  'eagle',
  'ear',
  'egg',
  'eggplant',
  'ektara',
  'elephant',
  'eye',
  'fish',
  'flower',
  'foot',
  'frog',
  'grapes',
  'hand',
  'hen',
  'icecream',
  'jug',
  'kite',
  'leafy',
  'lemon',
  'lion',
  'mango',
  'medicine',
  'monsoon',
  'moon',
  'mouse',
  'mouth',
  'nest',
  'nose',
  'onion',
  'orange',
  'owl',
  'parrot',
  'peacock',
  'pen',
  'plate',
  'potato',
  'pushcart',
  'python',
  'queen',
  'rabbit',
  'rainbow',
  'rice',
  'ship',
  'shrimp',
  'star',
  'sun',
  'tiger',
  'tomato',
  'umbrella',
  'van',
  'watch',
  'water-lily',
  'watermelon',
  'xylophone',
  'yak',
  'yam',
  'zebra',
]);

export function resolveVocabImageUrl(artKey: string): string | null {
  if (!artKey || artKey === 'color-swatch') return null;
  if (!VOCAB_IMAGE_KEYS.has(artKey)) return null;
  return `./images/vocab/${artKey}.webp`;
}

const preloadedImageUrls = new Set<string>();

export function preloadVocabImages(artKeys: string[]): void {
  if (typeof Image === 'undefined') return;
  for (const key of artKeys) {
    const url = resolveVocabImageUrl(key);
    if (!url || preloadedImageUrls.has(url)) continue;
    preloadedImageUrls.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}

export const PictureArt: React.FC<PictureArtProps> = ({
  artKey,
  label,
  colorHex,
  size = 'md',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [artKey]);

  const sizeClass =
    size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-28 h-28';

  if (artKey === 'color-swatch' && colorHex) {
    return (
      <div
        className={`${sizeClass} rounded-3xl border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden shrink-0`}
        style={{ backgroundColor: colorHex }}
        role="img"
        aria-label={label}
      >
        <div className="w-1/2 h-1/2 rounded-full bg-white/25 -translate-x-2 -translate-y-2" />
      </div>
    );
  }

  const imageUrl = resolveVocabImageUrl(artKey);

  if (!imageUrl || imgFailed) {
    return (
      <div
        className={`${sizeClass} rounded-2xl bg-amber-50 border border-amber-200 p-2 flex items-center justify-center shrink-0 select-none`}
        role="img"
        aria-label={label}
      >
        <span className="font-display font-bold text-amber-800 text-sm sm:text-base text-center px-1 leading-tight">
          {label}
        </span>
      </div>
    );
  }

  const paddingClass = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-2.5' : 'p-1.5';

  return (
    <div
      className={`${sizeClass} rounded-2xl bg-white border border-slate-200/90 shadow-xs ${paddingClass} flex items-center justify-center shrink-0 select-none overflow-hidden`}
    >
      <img
        src={imageUrl}
        alt={label}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
};
