'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 1800);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { message, show, toast };
}
