'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  title: string
  courseId?: string
  lessonId?: string
  userId?: string
  onProgressUpdate?: (progress: number, duration: number) => void
  onComplete?: () => void
  autoPlay?: boolean
  poster?: string
  className?: string
}

interface VideoProgress {
  currentTime: number
  duration: number
  percentage: number
}

export default function VideoPlayer({
  src,
  title,
  courseId,
  lessonId,
  userId,
  onProgressUpdate,
  onComplete,
  autoPlay = false,
  poster,
  className
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState<VideoProgress>({
    currentTime: 0,
    duration: 0,
    percentage: 0
  })
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState('auto')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto-hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsLoading(false)
      setProgress(prev => ({
        ...prev,
        duration: video.duration
      }))
    }

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime
      const duration = video.duration
      const percentage = duration > 0 ? (currentTime / duration) * 100 : 0

      setProgress({
        currentTime,
        duration,
        percentage
      })

      // Call progress update callback
      if (onProgressUpdate) {
        onProgressUpdate(currentTime, duration)
      }

      // Save progress to localStorage for persistence
      if (courseId && lessonId && userId) {
        const progressKey = `video_progress_${courseId}_${lessonId}_${userId}`
        localStorage.setItem(progressKey, JSON.stringify({
          currentTime,
          duration,
          percentage,
          lastWatched: new Date().toISOString()
        }))
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (onComplete) {
        onComplete()
      }
    }

    const handleError = () => {
      setError('Erreur lors du chargement de la vidéo')
      setIsLoading(false)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [courseId, lessonId, userId, onProgressUpdate, onComplete])

  // Load saved progress on component mount
  useEffect(() => {
    if (courseId && lessonId && userId && videoRef.current) {
      const progressKey = `video_progress_${courseId}_${lessonId}_${userId}`
      const savedProgress = localStorage.getItem(progressKey)
      
      if (savedProgress) {
        try {
          const { currentTime } = JSON.parse(savedProgress)
          if (currentTime > 10) { // Only resume if more than 10 seconds watched
            videoRef.current.currentTime = currentTime
          }
        } catch (error) {
          console.error('Error loading saved progress:', error)
        }
      }
    }
  }, [courseId, lessonId, userId])

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    resetControlsTimeout()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * video.duration
    video.currentTime = newTime
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className={cn("relative bg-gray-900 rounded-xl overflow-hidden", className)}>
        <div className="flex items-center justify-center h-64 text-white">
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn("relative bg-gray-900 rounded-xl overflow-hidden group", className)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <Button
            onClick={togglePlay}
            size="lg"
            className="rounded-full w-16 h-16 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
          >
            <Play className="h-8 w-8 text-white ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress.percentage]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(progress.currentTime)}</span>
            <span>{formatTime(progress.duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => skipTime(-10)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={togglePlay}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              onClick={() => skipTime(10)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => changePlaybackRate(Number(e.target.value))}
              className="bg-transparent text-white text-sm border border-white/20 rounded px-2 py-1"
            >
              <option value={0.5} className="bg-gray-800">0.5x</option>
              <option value={0.75} className="bg-gray-800">0.75x</option>
              <option value={1} className="bg-gray-800">1x</option>
              <option value={1.25} className="bg-gray-800">1.25x</option>
              <option value={1.5} className="bg-gray-800">1.5x</option>
              <option value={2} className="bg-gray-800">2x</option>
            </select>

            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      {title && (
        <div className={cn(
          "absolute top-4 left-4 right-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          <h3 className="text-white text-lg font-semibold bg-black bg-opacity-50 rounded px-3 py-2 backdrop-blur-sm">
            {title}
          </h3>
        </div>
      )}
    </div>
  )
}