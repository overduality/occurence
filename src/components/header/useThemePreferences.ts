"use client";

import { useCallback, useEffect, useState } from "react";
import { sounds } from "@/lib/sound";
import type { ThemeSetting } from "./types";

function applyMetaColorScheme(setting: ThemeSetting) {
  if (typeof document === "undefined") return;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) {
    meta.content = setting === "system" ? "light dark" : setting;
  }
}

export function useThemePreferences() {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>("system");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("color-scheme");
      if (saved === "light" || saved === "dark") {
        setThemeSetting(saved);
        applyMetaColorScheme(saved);
      } else {
        setThemeSetting("system");
        applyMetaColorScheme("system");
      }

      const reduced = localStorage.getItem("occuring-reduce-transparency") === "1";
      setReduceTransparency(reduced);
      if (reduced) {
        document.documentElement.setAttribute("data-reduce-transparency", "true");
      } else {
        document.documentElement.removeAttribute("data-reduce-transparency");
      }
    } catch {
      // Storage blocked; keep system default
    }

    setSoundMuted(sounds.isMuted());

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mql.matches);

    const handleMqlChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    const handleStorageSync = (event: StorageEvent) => {
      if (event.key === "color-scheme") {
        const next: ThemeSetting =
          event.newValue === "light" || event.newValue === "dark"
            ? event.newValue
            : "system";
        setThemeSetting(next);
        applyMetaColorScheme(next);
      }
    };

    mql.addEventListener("change", handleMqlChange);
    window.addEventListener("storage", handleStorageSync);

    return () => {
      mql.removeEventListener("change", handleMqlChange);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, []);

  const handleSelectTheme = useCallback((next: ThemeSetting) => {
    sounds.playPop();
    setThemeSetting(next);
    applyMetaColorScheme(next);
    try {
      if (next === "system") {
        localStorage.removeItem("color-scheme");
      } else {
        localStorage.setItem("color-scheme", next);
      }
    } catch {
      // Ignore storage quota restrictions
    }
  }, []);

  const handleToggleTransparency = useCallback(() => {
    sounds.playPop();
    setReduceTransparency((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.setAttribute("data-reduce-transparency", "true");
      } else {
        document.documentElement.removeAttribute("data-reduce-transparency");
      }
      try {
        if (next) {
          localStorage.setItem("occuring-reduce-transparency", "1");
        } else {
          localStorage.removeItem("occuring-reduce-transparency");
        }
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundMuted((prev) => {
      const next = !prev;
      sounds.setMuted(next);
      if (!next) {
        sounds.playPop();
      }
      return next;
    });
  }, []);

  return {
    themeSetting,
    systemPrefersDark,
    soundMuted,
    reduceTransparency,
    handleSelectTheme,
    handleToggleTransparency,
    handleToggleSound,
  };
}
