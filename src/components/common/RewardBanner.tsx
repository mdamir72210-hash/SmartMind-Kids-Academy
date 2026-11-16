import React from 'react';
import { Award, Sparkles, Star } from 'lucide-react';

interface RewardBannerProps {
  message: string;
  bengaliMessage?: string;
  tone: 'success' | 'encourage';
  pointsEarned?: number;
}

export const RewardBanner: React.FC<RewardBannerProps> = ({
  message,
  bengaliMessage,
  tone,
  pointsEarned,
}) => {
  const isSuccess = tone === 'success';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 transition-all ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}
        >
          {isSuccess ? <Award className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-display font-bold text-base sm:text-lg leading-snug">
            {message}
          </p>
          {bengaliMessage && (
            <p className="font-bengali text-sm font-medium opacity-90">{bengaliMessage}</p>
          )}
        </div>
      </div>

      {isSuccess && pointsEarned && pointsEarned > 0 ? (
        <div className="flex items-center gap-1.5 font-display font-bold text-emerald-700 tabular-nums text-sm sm:text-base">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>+{pointsEarned} pts</span>
        </div>
      ) : null}
    </div>
  );
};
