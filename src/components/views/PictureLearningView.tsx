import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Volume2 } from 'lucide-react';
import { PICTURE_CATEGORIES, PICTURE_ITEMS } from '../../data/pictureLearning';
import { useBengaliSpeech } from '../../hooks/useBengaliSpeech';
import { LearningProgress, PictureCategoryId, PictureItem } from '../../types/learning';
import { playTapSound, preloadEnglishTexts, speakEnglish } from '../../utils/audio';
import { PictureArt, preloadVocabImages } from '../common/PictureArt';

interface PictureLearningViewProps {
  progress: LearningProgress;
  onViewPicture: (id: string) => void;
}

export const PictureLearningView: React.FC<PictureLearningViewProps> = ({
  progress,
  onViewPicture,
}) => {
  const [activeCategory, setActiveCategory] = useState<PictureCategoryId>('animals');
  const [selectedItem, setSelectedItem] = useState<PictureItem | null>(null);
  const [audioHint, setAudioHint] = useState<string | null>(null);

  const {
    notice: bnNotice,
    clearNotice: clearBnNotice,
    preload: preloadBn,
    speak: speakBn,
  } = useBengaliSpeech(progress.settings.speechRate);

  const items = useMemo(
    () => PICTURE_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    preloadBn(items.map((item) => `${item.bengali}।`));
    void preloadEnglishTexts(items.map((item) => item.english));
    preloadVocabImages(items.map((item) => item.artKey));
  }, [items, preloadBn]);

  const currentMeta = PICTURE_CATEGORIES.find((c) => c.id === activeCategory)!;

  const handleCardTap = async (item: PictureItem) => {
    playTapSound(progress.settings.soundEffects);
    setSelectedItem(item);
    clearBnNotice();
    onViewPicture(item.id);
    const res = await speakEnglish(item.english, progress.settings.speechRate);
    if (!res.spoken) {
      setAudioHint(res.errorMessage || `Tap once more to hear "${item.english}".`);
    } else {
      setAudioHint(null);
    }
  };

  const handleHearBengali = (item: PictureItem) => {
    setAudioHint(null);
    onViewPicture(item.id);
    void speakBn(`${item.bengali}।`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Picture Learning · <span className="font-bengali">ছবি দেখে শেখা</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Tap any colorful card to hear the English word or its Bengali pronunciation.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {progress.picturesViewed.length} / {PICTURE_ITEMS.length} pictures explored
        </span>
      </div>

      {/* 8 Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {PICTURE_CATEGORIES.map((cat) => {
          const active = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playTapSound(progress.settings.soundEffects);
                setActiveCategory(cat.id);
                setSelectedItem(null);
                clearBnNotice();
              }}
              className={`px-4 py-2.5 min-h-[44px] rounded-2xl border font-bold text-sm transition-all whitespace-nowrap ${
                active
                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
              }`}
            >
              <span>{cat.title}</span>
              <span className={`font-bengali ml-1.5 text-xs ${active ? 'text-rose-100' : 'text-slate-500'}`}>
                ({cat.bengaliTitle})
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Item Spotlight (if tapped) */}
      {selectedItem && (
        <div className={`rounded-3xl border p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 ${currentMeta.accentBg} border-slate-200`}>
          <PictureArt
            artKey={selectedItem.artKey}
            label={selectedItem.english}
            colorHex={selectedItem.colorHex}
            size="lg"
          />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <span className="text-xs font-bold text-slate-500">
              {currentMeta.title} · {currentMeta.bengaliTitle}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              {selectedItem.english}
            </h2>
            <p className="font-bengali text-2xl sm:text-3xl font-bold text-rose-700">
              {selectedItem.bengali}
            </p>
            <p className="text-xs text-slate-600">Pronunciation: {selectedItem.phonetic}</p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={() => handleCardTap(selectedItem)}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm border-b-4 border-rose-800 active:translate-y-0.5 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear English</span>
              </button>
              <button
                type="button"
                onClick={() => handleHearBengali(selectedItem)}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm border-b-4 border-emerald-800 active:translate-y-0.5 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span className="font-bengali">বাংলায় শুনো</span>
              </button>
            </div>
            {audioHint && <p className="text-xs text-amber-800 pt-1">{audioHint}</p>}
          </div>
        </div>
      )}

      {bnNotice && (
        <div
          role="status"
          className={`flex items-start gap-2 text-xs font-medium rounded-xl px-3.5 py-2.5 border ${
            bnNotice.kind === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : bnNotice.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          {bnNotice.kind === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{bnNotice.text}</span>
        </div>
      )}

      {/* Picture Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const viewed = progress.picturesViewed.includes(item.id);
          const isSelected = selectedItem?.id === item.id;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border p-4 transition-all hover:shadow-md flex flex-col items-center text-center ${
                isSelected ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200'
              }`}
            >
              <div className="w-full flex justify-end h-5">
                {viewed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <button
                type="button"
                onClick={() => handleCardTap(item)}
                className="flex flex-col items-center w-full"
              >
                <PictureArt
                  artKey={item.artKey}
                  label={item.english}
                  colorHex={item.colorHex}
                  size="md"
                />
                <h3 className="font-display text-lg font-extrabold text-slate-900 mt-3">
                  {item.english}
                </h3>
                <p className="font-bengali text-base font-bold text-rose-700 mt-0.5">
                  {item.bengali}
                </p>
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 w-full">
                <button
                  type="button"
                  onClick={() => handleCardTap(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 min-h-[38px] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleHearBengali(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 min-h-[38px] rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold font-bengali transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>বাংলা</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
