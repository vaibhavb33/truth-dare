'use client';

import { useState, useEffect, useCallback } from 'react';
import { speechService, VoiceState, SpeakParams } from './speechService';
import { SupportedLanguageCode } from '@/types';

export function useVoice() {
  const [state, setState] = useState<VoiceState>(() => speechService.getState());

  useEffect(() => {
    const unsubscribe = speechService.subscribe((nextState) => {
      setState(nextState);
    });

    // Unsubscribe listener on unmount (Speech cancellation is handled globally on page unload)
    return () => {
      unsubscribe();
    };
  }, []);

  const speak = useCallback((params: SpeakParams) => {
    return speechService.speak(params);
  }, []);

  const stop = useCallback(() => {
    speechService.stop();
  }, []);

  const pause = useCallback(() => {
    return speechService.pause();
  }, []);

  const resume = useCallback(() => {
    return speechService.resume();
  }, []);

  const setRate = useCallback((rate: number) => {
    speechService.setRate(rate);
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    speechService.setVoice(voice);
  }, []);

  const getVoicesForLanguage = useCallback((lang: SupportedLanguageCode | string) => {
    return speechService.getVoicesForLanguage(lang);
  }, []);

  return {
    ...state,
    speak,
    stop,
    pause,
    resume,
    setRate,
    setVoice,
    getVoicesForLanguage,
  };
}
