'use client';

import { useState, useEffect, useCallback } from 'react';
import { speechService, VoiceState } from './speechService';
import { SupportedLanguageCode } from '@/types';

export function useVoice() {
  const [state, setState] = useState<VoiceState>(() => speechService.getState());

  useEffect(() => {
    const unsubscribe = speechService.subscribe((nextState) => {
      setState(nextState);
    });

    // Cleanup on unmount (Stops speech when navigating away)
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  const speak = useCallback(
    (params: {
      text: string;
      language: SupportedLanguageCode | string;
      rate?: number;
      voice?: SpeechSynthesisVoice;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }) => {
      return speechService.speak(params);
    },
    []
  );

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

