'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** 음성 읽기: 영어 문장들을 순서대로 재생 */
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
    (texts: string[]) => {
      if (!('speechSynthesis' in window)) {
        toast('이 브라우저는 음성 읽기를 지원하지 않습니다.');
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const id = ++token.current;
      const voices = synth.getVoices();
      const voice = voices.find((x) => x.lang.replace('_', '-').toLowerCase().startsWith('en'));
      texts.forEach((text, idx) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        if (voice) u.voice = voice;
        u.rate = 0.9;
        if (idx === texts.length - 1) {
          u.onend = u.onerror = () => {
            if (token.current === id) setSpeaking(false);
          };
        }
        synth.speak(u);
      });
      setSpeaking(true);
      if (voices.length && !voice) toast('English 음성이 설치되어 있지 않을 수 있습니다.');
    },
    [toast]
  );

  return { speaking, speakQueue, stop };
}
