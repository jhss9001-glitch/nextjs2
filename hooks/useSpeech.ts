'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LANG_NAME, LOCALE } from '@/lib/plain-text';
import type { OutLang } from '@/lib/types';

export interface SpeechPart {
  lang: OutLang;
  text: string;
}

/** 음성 읽기: [{ lang, text }] 순서대로 재생 */
export function useSpeech(toast: (msg: string) => void) {
  const [speaking, setSpeaking] = useState(false);
  const token = useRef(0);

  useEffect(() => {
    // 일부 브라우저는 음성 목록을 비동기로 불러옴
    if ('speechSynthesis' in window) speechSynthesis.getVoices();
    return () => {
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window && speechSynthesis.speaking) speechSynthesis.cancel();
    token.current++;
    setSpeaking(false);
  }, []);

  const speakQueue = useCallback(
    (parts: SpeechPart[]) => {
      if (!('speechSynthesis' in window)) {
        toast('이 브라우저는 음성 읽기를 지원하지 않습니다.');
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const id = ++token.current;
      const voices = synth.getVoices();
      parts.forEach((p, idx) => {
        const u = new SpeechSynthesisUtterance(p.text);
        u.lang = LOCALE[p.lang];
        const v = voices.find((x) => x.lang.replace('_', '-').toLowerCase().startsWith(p.lang));
        if (v) u.voice = v;
        u.rate = 0.9;
        if (idx === parts.length - 1) {
          u.onend = u.onerror = () => {
            if (token.current === id) setSpeaking(false);
          };
        }
        synth.speak(u);
      });
      setSpeaking(true);
      const langs = [...new Set(parts.map((p) => p.lang))];
      const missing = langs.filter((l) => !voices.some((x) => x.lang.toLowerCase().startsWith(l)));
      if (voices.length && missing.length) {
        toast(`${missing.map((l) => LANG_NAME[l]).join(', ')} 음성이 설치되어 있지 않을 수 있습니다.`);
      }
    },
    [toast]
  );

  return { speaking, speakQueue, stop };
}
