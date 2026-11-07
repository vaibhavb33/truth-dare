'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings2,
  ChevronDown,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useVoice } from '@/lib/voice/useVoice';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { SupportedLanguageCode } from '@/types';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';

interface QuestionVoiceControlsProps {
  text: string;
  language?: SupportedLanguageCode | string;
  type?: 'truth' | 'dare' | 'question';
  variant?: 'card' | 'compact' | 'pill';
  className?: string;
}

export function QuestionVoiceControls({
  text,
  language,
  type = 'question',
  variant = 'card',
  className,
}: QuestionVoiceControlsProps) {
  const { dict, locale } = useTranslation();
  const currentLang = language || locale;
  const {
    isSupported,
    isPlaying,
    isPaused,
    currentText,
    rate,
    speak,
    stop,
    pause,
    resume,
    setRate,
    setVoice,
    getVoicesForLanguage,
    error,
  } = useVoice();

  const [showSettings, setShowSettings] = useState(false);
  const [unavailableNotice, setUnavailableNotice] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isCurrentCardPlaying = isPlaying && currentText === text;
  const isCurrentCardPaused = isPaused && currentText === text;

  const matchingVoices = getVoicesForLanguage(currentLang);
  const hasMatchingVoice = isSupported && matchingVoices.length > 0;

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettings]);

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.triggerHaptic(15);

    if (!isSupported || !hasMatchingVoice) {
      setUnavailableNotice(true);
      setTimeout(() => setUnavailableNotice(false), 4000);
      return;
    }

    if (isCurrentCardPlaying) {
      // If currently playing this card, pausing or stopping
      stop();
    } else if (isCurrentCardPaused) {
      // Resume
      resume();
    } else {
      // Start fresh speech for this text
      speak({
        text,
        language: currentLang,
        rate,
        onError: () => {
          setUnavailableNotice(true);
          setTimeout(() => setUnavailableNotice(false), 4000);
        },
      });
    }
  };

  const handlePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.triggerHaptic(10);
    if (isCurrentCardPlaying) {
      pause();
    } else if (isCurrentCardPaused) {
      resume();
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.triggerHaptic(10);
    stop();
  };

  const speeds = [0.75, 1.0, 1.25, 1.5];

  // ========================================================
  // VARIANT: COMPACT (Round button for table/list items)
  // ========================================================
  if (variant === 'compact') {
    return (
      <div className={cn('relative inline-flex items-center gap-1', className)}>
        <button
          type="button"
          onClick={handlePlayToggle}
          aria-label={
            isCurrentCardPlaying
              ? dict.voice.stop
              : type === 'truth'
              ? dict.voice.listenTruth
              : type === 'dare'
              ? dict.voice.listenDare
              : dict.voice.listenQuestion
          }
          title={
            !hasMatchingVoice
              ? dict.voice.voiceUnavailableDesc
              : isCurrentCardPlaying
              ? dict.voice.stop
              : dict.voice.play
          }
          className={cn(
            'p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 min-w-[36px] min-h-[36px] active:scale-95',
            isCurrentCardPlaying
              ? 'bg-brand-500 text-white border-brand-400 shadow-glow-brand animate-pulse'
              : !hasMatchingVoice
              ? 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-400'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
          )}
        >
          {isCurrentCardPlaying ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : !hasMatchingVoice ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {unavailableNotice && (
          <div className="absolute left-full ml-2 z-50 p-2 rounded-xl bg-slate-900/95 border border-amber-500/30 text-amber-300 text-[11px] shadow-elevation-3 whitespace-nowrap backdrop-blur-md">
            {dict.voice.voiceUnavailableDesc}
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // VARIANT: PILL (Button with icon and text)
  // ========================================================
  if (variant === 'pill') {
    return (
      <div className={cn('relative inline-flex items-center', className)}>
        <button
          type="button"
          onClick={handlePlayToggle}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-sm',
            isCurrentCardPlaying
              ? 'bg-brand-500 text-white border-brand-400 shadow-glow-brand animate-pulse'
              : type === 'truth'
              ? 'bg-truth-500/15 hover:bg-truth-500/25 text-truth-300 border-truth-400/30'
              : type === 'dare'
              ? 'bg-dare-500/15 hover:bg-dare-500/25 text-dare-300 border-dare-400/30'
              : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
          )}
        >
          {isCurrentCardPlaying ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span>
            {isCurrentCardPlaying
              ? dict.voice.stop
              : type === 'truth'
              ? dict.voice.listenTruth
              : type === 'dare'
              ? dict.voice.listenDare
              : dict.voice.listenQuestion}
          </span>
        </button>
      </div>
    );
  }

  // ========================================================
  // VARIANT: CARD (Integrated bar for 3D Question Card)
  // ========================================================
  return (
    <div
      ref={popoverRef}
      className={cn(
        'relative inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-subtle',
        className
      )}
    >
      {/* Primary Play / Stop Button */}
      <button
        type="button"
        onClick={handlePlayToggle}
        aria-label={
          isCurrentCardPlaying
            ? dict.voice.stop
            : type === 'truth'
            ? dict.voice.listenTruth
            : type === 'dare'
            ? dict.voice.listenDare
            : dict.voice.listenQuestion
        }
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all min-h-[34px] active:scale-95',
          isCurrentCardPlaying
            ? 'bg-brand-500 text-white border border-brand-300 shadow-glow-brand'
            : type === 'truth'
            ? 'bg-truth-500/20 hover:bg-truth-500/30 text-truth-300 border border-truth-400/30'
            : 'bg-dare-500/20 hover:bg-dare-500/30 text-dare-300 border border-dare-400/30'
        )}
      >
        {isCurrentCardPlaying ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{dict.voice.stop}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {type === 'truth' ? dict.voice.listenTruth : type === 'dare' ? dict.voice.listenDare : dict.voice.listenQuestion}
            </span>
            <span className="xs:hidden">{dict.voice.play}</span>
          </>
        )}
      </button>

      {/* Pause / Resume Controls (Only visible when active) */}
      {(isCurrentCardPlaying || isCurrentCardPaused) && (
        <button
          type="button"
          onClick={handlePauseResume}
          aria-label={isCurrentCardPaused ? dict.voice.resume : dict.voice.pause}
          title={isCurrentCardPaused ? dict.voice.resume : dict.voice.pause}
          className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 min-h-[34px] min-w-[34px] flex items-center justify-center active:scale-95"
        >
          {isCurrentCardPaused ? (
            <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
          ) : (
            <Pause className="w-3.5 h-3.5 fill-current text-amber-300" />
          )}
        </button>
      )}

      {/* Settings / Speed Popover Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowSettings(!showSettings);
          sound.triggerHaptic(10);
        }}
        aria-label={dict.voice.speed}
        title={dict.voice.speed}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all min-h-[34px] active:scale-95',
          showSettings
            ? 'bg-brand-500/30 text-brand-300 border-brand-400/50'
            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
        )}
      >
        <span>{rate}x</span>
        <Settings2 className="w-3 h-3 text-slate-400" />
      </button>

      {/* Speed & Voice Selection Popover */}
      {showSettings && (
        <div className="absolute bottom-full mb-2 left-0 sm:left-auto sm:right-0 z-50 w-64 p-3.5 rounded-2xl bg-[#121226]/95 border border-white/15 shadow-elevation-3 backdrop-blur-xl space-y-3 text-left animate-in fade-in zoom-in-95 duration-150">
          {/* Speaking Rate Controls */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {dict.voice.speed}
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {speeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setRate(s);
                    sound.triggerHaptic(10);
                  }}
                  className={cn(
                    'py-1 rounded-lg text-xs font-bold font-mono transition-all border',
                    rate === s
                      ? 'bg-brand-500 text-white border-brand-400 shadow-glow-brand'
                      : 'bg-surface-elevated text-slate-300 border-white/5 hover:text-white'
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector */}
          {matchingVoices.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {dict.voice.selectVoice} ({matchingVoices.length}):
              </span>
              <select
                aria-label={dict.voice.selectVoice}
                onChange={(e) => {
                  const found = matchingVoices.find((v) => v.voiceURI === e.target.value);
                  setVoice(found || null);
                  sound.triggerHaptic(10);
                }}
                className="w-full text-[11px] p-2 rounded-xl bg-surface-elevated border border-white/10 text-white focus:outline-none focus:border-brand-400 truncate"
              >
                <option value="">{dict.voice.defaultVoice}</option>
                {matchingVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!hasMatchingVoice && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{dict.voice.voiceUnavailableDesc}</span>
            </div>
          )}
        </div>
      )}

      {/* Helpful Toast when voice is unavailable */}
      {unavailableNotice && (
        <div className="absolute bottom-full mb-2 left-0 right-0 z-50 p-2.5 rounded-xl bg-[#1A1A32]/95 border border-amber-500/40 text-amber-300 text-[11px] shadow-elevation-3 backdrop-blur-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{dict.voice.voiceUnavailableDesc}</span>
        </div>
      )}
    </div>
  );
}
