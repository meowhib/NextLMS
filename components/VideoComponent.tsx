"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
// const ReactPlayer = dynamic(() => import("react-player/lazy"), {
//   ssr: false,
// });
import ReactPlayer from "react-player";

export default function VideoComponent({
  src,
  progress,
  lessonId,
}: {
  src: string;
  progress: number;
  lessonId: string;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onReady = useCallback(() => {
    if (!isReady) {
      const timeToStart = progress || 0;
      playerRef.current?.seekTo(timeToStart);
      setIsReady(true);
      setIsPlaying(true);
    }
  }, [isReady, progress]);

  async function updateProgress(
    lessonId: string,
    progress: number,
    completed: boolean
  ) {
    await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lessonId,
        userProgressSeconds: progress,
        completed,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Progress updated!");
        } else {
          console.error("Progress update failed!");
        }
      })
      .catch((error) => {
        console.error("Progress update failed!");
      });
  }

  if (!isClient) {
    return null;
  }

  return (
    <ReactPlayer
      ref={playerRef}
      url={src}
      playing={isPlaying}
      height={"100"}
      width={"100"}
      progressInterval={5000}
      onProgress={async (progress: any) => {
        if (duration && duration - progress.playedSeconds < 10) {
          await updateProgress(lessonId, duration, true);
        } else {
          await updateProgress(lessonId, progress.playedSeconds, false);
        }
      }}
      controls
      onReady={onReady}
      onDuration={(duration: any) => setDuration(duration)}
    />
  );
}
