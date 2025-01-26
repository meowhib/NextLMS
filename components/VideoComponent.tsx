"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
// const ReactPlayer = dynamic(() => import("react-player/lazy"), {
//   ssr: false,
// });
import ReactPlayer from "react-player";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, SkipForward } from "lucide-react";
import screenfull from 'screenfull';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const VOLUME_STORAGE_KEY = 'video-player-volume';

export default function VideoComponent({
  src,
  progress = 0,
  lessonId,
  courseSlug,
  onNextLesson,
  hasNextLesson,
}: {
  src: string;
  progress?: number;
  lessonId: string;
  courseSlug: string;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
      return savedVolume ? parseFloat(savedVolume) : 0.8;
    }
    return 0.8;
  });
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
      return savedVolume ? parseFloat(savedVolume) === 0 : false;
    }
    return false;
  });
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout>();

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    // Save volume to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(VOLUME_STORAGE_KEY, newVolume.toString());
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        // Store current volume before muting
        if (volume > 0) {
          localStorage.setItem(VOLUME_STORAGE_KEY, '0');
        }
      } else {
        // Restore previous volume
        if (volume === 0) {
          const previousVolume = '0.8';
          setVolume(parseFloat(previousVolume));
          localStorage.setItem(VOLUME_STORAGE_KEY, previousVolume);
        }
      }
      return newMuted;
    });
  }, [volume]);

  const handleFullscreenToggle = useCallback(() => {
    if (containerRef.current && screenfull.isEnabled) {
      screenfull.toggle(containerRef.current);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    // Only fetch playback speed from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        if (settings?.defaultPlaybackSpeed) {
          setPlaybackSpeed(settings.defaultPlaybackSpeed);
        }
      })
      .catch(error => {
        console.error('Failed to fetch user settings:', error);
      });

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in form elements
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'f':
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 0.05, 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 0.05, 0));
          break;
        case 'arrowleft':
          e.preventDefault();
          if (playerRef.current && duration) {
            const currentTime = playerRef.current.getCurrentTime();
            const newTime = Math.max(currentTime - 5, 0);
            playerRef.current.seekTo(newTime);
            setPlayed(newTime / duration);
          }
          break;
        case 'arrowright':
          e.preventDefault();
          if (playerRef.current && duration) {
            const currentTime = playerRef.current.getCurrentTime();
            const newTime = Math.min(currentTime + 5, duration);
            playerRef.current.seekTo(newTime);
            setPlayed(newTime / duration);
          }
          break;
        case 'm':
          e.preventDefault();
          handleToggleMute();
          break;
        default:
          // Handle number keys 0-9 for percentage seeking
          if (/^[0-9]$/.test(e.key) && duration) {
            e.preventDefault();
            const percent = parseInt(e.key) / 10;
            const seekTime = duration * percent;
            playerRef.current?.seekTo(seekTime);
            setPlayed(percent);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [duration, handlePlayPause, handleFullscreenToggle, handleVolumeChange, handleToggleMute, volume]);

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

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat((e.target as HTMLInputElement).value));
    }
  };

  const formatTime = (seconds: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0 
      ? `${hours}:${pad(minutes)}:${pad(secs)}`
      : `${minutes}:${pad(secs)}`;
  };

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Don't toggle play/pause if clicking on controls
    const target = e.target as HTMLElement;
    if (target.closest('.video-controls')) return;
    handlePlayPause();
  }, [handlePlayPause]);

  if (!isClient) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-video bg-black group ${
        isPlaying && !showControls ? 'cursor-none' : 'cursor-auto'
      }`}
      onClick={handleContainerClick}
      onDoubleClick={handleFullscreenToggle}
      onMouseEnter={() => {
        setShowControls(true);
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          controlsTimeout.current = setTimeout(() => setShowControls(false), 2000);
        }
      }}
      onMouseMove={() => {
        setShowControls(true);
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
        if (isPlaying) {
          controlsTimeout.current = setTimeout(() => setShowControls(false), 2000);
        }
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={src.startsWith('http') ? src : `https://${src}`}
        playing={isPlaying}
        height="100%"
        width="100%"
        progressInterval={1000}
        playbackRate={playbackSpeed}
        volume={volume}
        muted={isMuted}
        onProgress={(state) => {
          if (!seeking) {
            setPlayed(state.played);
            if (duration && duration - state.playedSeconds < 10) {
              updateProgress(courseSlug, lessonId, duration, true);
            } else {
              updateProgress(courseSlug, lessonId, state.playedSeconds, false);
            }
          }
        }}
        onReady={onReady}
        onDuration={setDuration}
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

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 video-controls ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-sm">{formatTime(duration * played)}</span>
          <div className="relative flex-grow h-1.5 group">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
            />
            <div className="absolute w-full h-full bg-gray-600 rounded-full">
              <div 
                className="absolute h-full bg-primary rounded-full" 
                style={{ width: `${played * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full transform translate-x-1/2 shadow-md group-hover:scale-125 transition-transform" />
              </div>
            </div>
          </div>
          <span className="text-white text-sm">{formatTime(duration)}</span>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button onClick={handlePlayPause} className="text-white hover:text-primary">
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          {/* Next Lesson Button */}
          {hasNextLesson && (
            <button 
              onClick={onNextLesson} 
              className="text-white hover:text-primary"
              title="Next Lesson"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button onClick={handleToggleMute} className="text-white hover:text-primary">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
            <div className="relative w-20 h-1.5 group">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute w-full h-full bg-gray-600 rounded-full">
                <div 
                  className="absolute h-full bg-primary rounded-full" 
                  style={{ width: `${volume * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full transform translate-x-1/2 shadow-md group-hover:scale-125 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Playback Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 px-2 text-white hover:text-primary hover:bg-transparent"
                >
                  {playbackSpeed}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" className="z-[60]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                    <DropdownMenuItem 
                      key={speed}
                      onClick={() => handlePlaybackRateChange(speed)}
                      className={playbackSpeed === speed ? "bg-primary/20" : ""}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>

            {/* Fullscreen Button */}
            <button onClick={handleFullscreenToggle} className="text-white hover:text-primary">
              {isFullscreen ? (
                <Minimize2 className="w-6 h-6" />
              ) : (
                <Maximize2 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
