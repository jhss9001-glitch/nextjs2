'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const norm = (lang: string) => lang.replace('_', '-').toLowerCase();

/** 영어 원어민 음성 선택: en-US 고품질 → en-US → en-GB 등 영어권 → 기타 en */
function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const en = voices.filter((v) => norm(v.lang).startsWith('en'));
  const score = (v: SpeechSynthesisVoice) => {
    const l = norm(v.lang);
    let s = 0;
    if (l === 'en-us') s += 100;
    else if (['en-gb', 'en-au', 'en-ca'].includes(l)) s += 60;
    else if (l === 'en-in') s += 10;
    else s += 30;
    if (/natural|neural|online/i.test(v.name)) s += 40;
    if (/google|aria|jenny|samantha|zira|david|alex|ava|allison/i.test(v.name)) s += 20;
    if (!v.localService) s += 5;
    return s;
  };
  return en.sort((a, b) => score(b) - score(a))[0];
}

/** 음성 목록은 비동기로 로드되므로 준비될 때까지 대기 */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener('voiceschanged', done);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', done);
    setTimeout(done, 1500);
  });
}

/** 음성 읽기: 영어 문장들을 순서대로 재생 */
export function useSpeech(toast: (msg: string) => void) {
  const [speaking, setSpeaking] = useState(false);
  const token = useRef(0);

  useEffect(() => {
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
    async (texts: string[]) => {
      if (!('speechSynthesis' in window)) {
        toast('이 브라우저는 음성 읽기를 지원하지 않습니다.');
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const id = ++token.current;
      setSpeaking(true);
      const voices = await loadVoices();
      if (token.current !== id) return;
      const voice = pickEnglishVoice(voices);
      if (!voice) toast('영어 음성이 설치되어 있지 않아 재생이 안 될 수 있습니다. OS 설정에서 English 음성을 추가해 주세요.');
      // cancel 직후 바로 speak 하면 Chrome에서 무음이 되는 경우가 있어 잠시 대기
      await new Promise((r) => setTimeout(r, 80));
      if (token.current !== id) return;
      texts.forEach((text, idx) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = voice?.lang || 'en-US';
        if (voice) u.voice = voice;
        u.rate = 0.9;
        if (idx === texts.length - 1) {
          u.onend = u.onerror = () => {
            if (token.current === id) setSpeaking(false);
          };
        }
        synth.speak(u);
      });
    },
    [toast]
  );

  return { speaking, speakQueue, stop };
}
