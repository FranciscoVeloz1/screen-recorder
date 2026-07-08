import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/formatTime";

export function useRecordingTimer() {
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSeconds = useCallback(() => {
    return secondsRef.current;
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    secondsRef.current = 0;
    setSeconds(0);
  }, [stop]);

  const start = useCallback(() => {
    reset();
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) {
        return;
      }
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      secondsRef.current = elapsed;
      setSeconds(elapsed);
    }, 1000);
  }, [reset]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    seconds,
    formatted: formatTime(seconds),
    getSeconds,
    start,
    stop,
    reset,
  };
}
