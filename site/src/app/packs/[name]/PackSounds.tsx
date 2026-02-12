"use client";

import { AudioPlayer } from "@/components/ui/AudioPlayer";
import type { SoundEntry } from "@/lib/types";

export function PackSounds({
  sounds,
  packName,
  categoryName,
}: {
  sounds: SoundEntry[];
  packName: string;
  categoryName: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {sounds.map((sound, i) => (
        <AudioPlayer
          key={sound.file}
          url={sound.audioUrl}
          label={sound.label}
          id={`${packName}-${categoryName}-${i}`}
        />
      ))}
    </div>
  );
}
