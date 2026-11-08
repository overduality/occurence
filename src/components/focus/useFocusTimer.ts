"use client";

import { useEffect, useState } from "react";
import { sounds } from "@/lib/sound";

export function useFocusTimer({
  kickstartTimerTrigger,
  onRecordFocusMinutes,
}: {
  kickstartTimerTrigger: number;
  onRecordFocusMinutes: (minutes: number) => void;
}) {
  const [presetMinutes, setPresetMinutes] = useState<number>(2);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (kickstartTimerTrigger > 0) {
      setPresetMinutes(2);
      setSecondsLeft(120);
      setTimerRunning(true);
    }
  }, [kickstartTimerTrigger]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          sounds.playComplete();
          onRecordFocusMinutes(presetMinutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, presetMinutes, onRecordFocusMinutes]);

  const formattedTimer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60
  ).padStart(2, "0")}`;

  const handleSelectPreset = (mins: number, secs: number) => {
    sounds.playPop();
    setTimerRunning(false);
    setPresetMinutes(mins);
    setSecondsLeft(secs);
  };

  const toggleTimer = () => {
    sounds.playPop();
    if (secondsLeft === 0) setSecondsLeft(presetMinutes * 60);
    setTimerRunning((r) => !r);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsLeft(presetMinutes * 60);
  };

  const startKickstartTimer = () => {
    sounds.playPop();
    setPresetMinutes(2);
    setSecondsLeft(120);
    setTimerRunning(true);
  };

  return {
    presetMinutes,
    secondsLeft,
    timerRunning,
    formattedTimer,
    handleSelectPreset,
    toggleTimer,
    resetTimer,
    startKickstartTimer,
  };
}
