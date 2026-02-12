"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";

interface AudioContextValue {
  play: (url: string, id: string) => void;
  stop: () => void;
  currentId: string | null;
}

const AudioCtx = createContext<AudioContextValue>({
  play: () => {},
  stop: () => {},
  currentId: null,
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setCurrentId(null);
  }, []);

  const play = useCallback(
    (url: string, id: string) => {
      stop();
      const audio = new Audio(url);
      audioRef.current = audio;
      setCurrentId(id);
      audio.play().catch(() => {});
      audio.addEventListener("ended", () => {
        if (audioRef.current === audio) {
          setCurrentId(null);
          audioRef.current = null;
        }
      });
    },
    [stop]
  );

  return (
    <AudioCtx.Provider value={{ play, stop, currentId }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}

export function AudioPlayer({
  url,
  label,
  id,
  compact,
}: {
  url: string;
  label: string;
  id: string;
  compact?: boolean;
}) {
  const { play, stop, currentId } = useAudio();
  const isPlaying = currentId === id;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) {
      stop();
    } else {
      play(url, id);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`${isPlaying ? "Stop" : "Play"}: ${label}`}
      className={`group flex items-center gap-2 rounded-lg border transition-all duration-200 text-left ${
        isPlaying
          ? "border-gold bg-gold-glow shadow-[0_0_12px_rgba(255,171,1,0.2)]"
          : "border-surface-border bg-surface-card hover:border-gold/50"
      } ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
    >
      <span
        className={`flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${
          compact ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"
        } ${
          isPlaying
            ? "bg-gold text-black"
            : "bg-surface-border text-text-muted group-hover:bg-gold/20 group-hover:text-gold"
        }`}
      >
        {isPlaying ? "■" : "▶"}
      </span>
      <span
        className={`text-text-body truncate ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
