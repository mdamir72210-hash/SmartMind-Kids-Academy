import React from 'react';
import { BookOpen, Calculator, Gamepad2, Home, ShieldCheck, Sparkles } from 'lucide-react';
import { AppSection } from '../../types/learning';

interface TopNavProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const DESKTOP_LINKS: { id: AppSection; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'english', label: 'English A–Z' },
  { id: 'bengali', label: 'বাংলা' },
  { id: 'math', label: 'Math' },
  { id: 'games', label: 'Play Quiz' },
];

const MOBILE_TABS: { id: AppSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'english', label: 'A–Z', icon: BookOpen },
  { id: 'bengali', label: 'বাংলা', icon: Sparkles },
  { id: 'math', label: 'Math', icon: Calculator },
  { id: 'games', label: 'Quiz', icon: Gamepad2 },
];

export const TopNav: React.FC<TopNavProps> = ({ activeSection, onNavigate }) => {
  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-700 transition-colors"
          >
            SmartMind Kids Academy
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            {DESKTOP_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-sky-700 border-sky-600'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('parent')}
              className={`inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors ${
                activeSection === 'parent'
                  ? 'bg-slate-900 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Parent Area</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 mobile-bottom-nav"
      >
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                isActive ? 'text-sky-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-tight mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
