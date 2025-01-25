"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
// const ReactPlayer = dynamic(() => import("react-player/lazy"), {
//   ssr: false,
// });
import ReactPlayer from "react-player";

export default function VideoComponent({
  src,
  progress = 0,
  lessonId,
  courseSlug,
}: {
  src: string;
  progress?: number;
  lessonId: string;
  courseSlug: string;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const playerRef = useRef<ReactPlayer>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Fetch user's default playback speed
    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        console.log("Settings:", settings);
        if (settings?.defaultPlaybackSpeed) {
          setPlaybackSpeed(settings.defaultPlaybackSpeed);
        }
      })
      .catch(error => {
        console.error('Failed to fetch user settings:', error);
      });
  }, []);

  const onReady = useCallback(() => {
    if (!isReady) {
      const timeToStart = progress || 0;
      playerRef.current?.seekTo(timeToStart);
      setIsReady(true);
      setIsPlaying(true);
    }
  }, [isReady, progress]);

  // Function to handle playback rate changes from the player
  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackSpeed(rate);
    // Save the new playback speed as user's default
    fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ defaultPlaybackSpeed: rate }),
    }).catch(error => {
      console.error('Failed to update user settings:', error);
    });
  }, []);

  async function updateProgress(
    courseSlug: string,
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
        courseSlug,
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
      url={src.startsWith('http') ? src : `https://${src}`}
      playing={isPlaying}
      height="100%"
      width="100%"
      progressInterval={5000}
      playbackRate={playbackSpeed}
      onProgress={async (progress: any) => {
        if (duration && duration - progress.playedSeconds < 10) {
          await updateProgress(courseSlug, lessonId, duration, true);
        } else {
          await updateProgress(
            courseSlug,
            lessonId,
            progress.playedSeconds,
            false
          );
        }
      }}
      controls
      onReady={onReady}
      onDuration={(duration: any) => setDuration(duration)}
      onPlaybackRateChange={handlePlaybackRateChange}
      config={{
        file: {
          forceVideo: true,
          attributes: {
            crossOrigin: "anonymous"
          }
        }
      }}
    />
  );
}
