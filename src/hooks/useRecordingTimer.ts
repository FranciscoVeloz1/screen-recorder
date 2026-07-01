import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/formatTime";

export function useRecordingTimer() {
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSeconds = useCallback(() => secondsRef.current, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    secondsRef.current = 0;
    setSeconds(0);
  }, [stop]);

  const start = useCallback(() => {
    reset();
    intervalRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);
  }, [reset]);

  useEffect(() => () => stop(), [stop]);

  return {
    seconds,
    formatted: formatTime(seconds),
    getSeconds,
    start,
    stop,
    reset,
  };
}
