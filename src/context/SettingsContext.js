import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  // Appearance
  fontSize: "md",
  compactMode: false,
  // Sound
  soundEnabled: false,
  soundVolume: 0.5,
  sendSound: "pop",
  receiveSound: "chime",
  // Voice
  voiceInputEnabled: false,
  voiceInputLang: "en-US",
  // Shortcuts
  keyboardShortcuts: true,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("at_settings");
      return saved
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("at_settings", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem("at_settings", JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
  }, []);

  // ── Sound engine ──────────────────────────────────────────
  // Simple beep tones generated via Web Audio API, no external files needed
  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      } catch {
        return null;
      }
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback(
    (freq, duration, type = "sine") => {
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = freq;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(
          settings.soundVolume * 0.4,
          ctx.currentTime,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + duration,
        );
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch {}
    },
    [settings.soundVolume, getAudioContext],
  );

  const playSound = useCallback(
    (type = "receive") => {
      if (!settings.soundEnabled) return;
      if (type === "send") {
        const s = settings.sendSound;
        if (s === "whoosh") {
          playBeep(800, 0.15, "sawtooth");
          playBeep(400, 0.1, "sawtooth");
        } else if (s === "pop") {
          playBeep(600, 0.08, "sine");
        }
      } else {
        const s = settings.receiveSound;
        if (s === "chime") {
          playBeep(880, 0.2, "sine");
          setTimeout(() => playBeep(1100, 0.2, "sine"), 120);
        } else if (s === "ding") {
          playBeep(1000, 0.3, "triangle");
        }
      }
    },
    [
      settings.soundEnabled,
      settings.sendSound,
      settings.receiveSound,
      playBeep,
    ],
  );

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, resetSettings, playSound }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};

export default SettingsContext;
