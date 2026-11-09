import React, { useState, useEffect } from 'react';
import { templeSound } from '../utils/audioChime';
import { Sparkles, ArrowRight, Sun } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  autoHideDuration?: number; // default 2400ms
  allowDismiss?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  autoHideDuration = 2400,
  allowDismiss = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar fill
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / autoHideDuration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 30);

    // Auto dismiss timer
    const timer = setTimeout(() => {
      dismissSplash();
    }, autoHideDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [autoHideDuration]);

  const dismissSplash = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 550);
  };

  const handleMedallionClick = () => {
    try {
      templeSound.playSwamiChant('voice');
    } catch {
      // Audio fallback
    }
  };

  const handleEnterClick = () => {
    try {
      templeSound.playBell(780, 0.5);
    } catch {
      // Audio fallback
    }
    dismissSplash();
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर - दर्शन व प्रवेश"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-8 select-none transition-all duration-500 ease-out ${
        isFading ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 38%, #b45309 0%, #9a3412 35%, #7c2d12 70%, #451a03 100%)',
      }}
    >
      {/* Decorative Traditional Auspicious Top Header Aura */}
      <div className="w-full flex items-center justify-between max-w-sm pt-2 text-amber-200/90 text-xs font-semibold">
        <div className="flex items-center gap-1.5 tracking-wider uppercase text-[11px] font-bold text-amber-300 drop-shadow-sm">
          <Sun className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '16s' }} />
          <span>नित्य दर्शन व पंचांग</span>
        </div>
        <div className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-black/30 border border-amber-400/40 text-amber-200">
          जयसिंगपूर
        </div>
      </div>

      {/* Central Sacred Medallion with the User's Darshan Image */}
      <div className="my-auto flex flex-col items-center text-center max-w-sm w-full space-y-5 animate-in fade-in zoom-in-95 duration-500">
        {/* Divine Aura Glow Behind Maharaj's Photo */}
        <div className="relative group cursor-pointer" onClick={handleMedallionClick} title="दर्शन व नामजप ऐकण्यासाठी टॅप करा">
          {/* Pulsing ambient sacred halos */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/30 via-orange-500/40 to-yellow-300/30 blur-xl animate-pulse" />
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 opacity-90 blur-xs" />

          {/* Master Framed Medallion */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 shadow-2xl shadow-black/60 ring-4 ring-amber-300/90 overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-100/90 bg-amber-950">
              <img
                src="/assets/aistudio/img_2912_1024_edcd846d.jpg"
                alt="श्री स्वामी समर्थ महाराज, जयसिंगपूर"
                className="w-full h-full object-cover object-top filter contrast-105 brightness-105"
                onError={(e) => {
                  // Fallback to high-res PWA icon if path issues occur
                  (e.target as HTMLImageElement).src = '/pwa-512x512.png';
                }}
              />
            </div>

            {/* Glowing gold inner ring highlight */}
            <div className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-inset ring-white/40" />
          </div>

          {/* Sacred Om Medallion Pin */}
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider border-2 border-amber-200 shadow-lg whitespace-nowrap">
            ॥ श्री स्वामी समर्थ ॥
          </span>
        </div>

        {/* Sacred Temple Identity Titles */}
        <div className="space-y-1.5 pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-tight drop-shadow-md leading-tight">
            श्री स्वामी समर्थ सेवा केंद्र
          </h1>
          <p className="text-sm sm:text-base font-extrabold text-amber-300/95 drop-shadow-xs">
            सेवा दरबार, जयसिंगपूर
          </p>
          <p className="text-xs text-amber-200/80 font-medium">
            तालुका: शिरोळ, जिल्हा: कोल्हापूर • महाराष्ट्र
          </p>
        </div>

        {/* Sacred Divine Reassurance Quote */}
        <div className="py-2 px-4 rounded-2xl bg-black/25 backdrop-blur-xs border border-amber-400/30 shadow-inner max-w-xs mx-auto">
          <p className="text-xs sm:text-sm font-black text-amber-200 tracking-wide">
            "भिऊ नकोस मी तुझ्या पाठीशी आहे"
          </p>
          <p className="text-[10px] text-amber-300/80 mt-0.5 font-bold">
            ॥ अशक्य ही शक्य करतील स्वामी ॥
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Instant Skip / Enter Button */}
      <div className="w-full max-w-xs space-y-3 pb-2 text-center">
        {/* Subtle Golden Progress Loading Line */}
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-amber-400/30">
            <div
              className="h-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-200/75 font-semibold px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>दिनदर्शिका लोड होत आहे...</span>
            </span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Direct Enter Button */}
        {allowDismiss && (
          <button
            type="button"
            onClick={handleEnterClick}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs sm:text-sm shadow-lg shadow-black/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-amber-100"
          >
            <span>थेट प्रवेश करा</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
