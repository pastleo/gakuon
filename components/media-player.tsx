"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Play, Maximize, Minimize } from "lucide-react"
import YouTube, { YouTubeProps } from "react-youtube"

// Flashcard and Deck types
interface Flashcard {
  id: string
  front: string
  back: string
}

interface Deck {
  id: string
  name: string
  cards: Flashcard[]
}

// Mock data for flashcard decks
const mockDecks: Deck[] = [
  {
    id: "japanese-basic",
    name: "Japanese Basic Vocabulary",
    cards: [
      { id: "1", front: "こんにちは", back: "Hello" },
      { id: "2", front: "ありがとう", back: "Thank you" },
      { id: "3", front: "さようなら", back: "Goodbye" },
      { id: "4", front: "おはよう", back: "Good morning" },
      { id: "5", front: "おやすみ", back: "Good night" },
    ]
  },
  {
    id: "japanese-numbers",
    name: "Japanese Numbers",
    cards: [
      { id: "6", front: "一 (いち)", back: "One" },
      { id: "7", front: "二 (に)", back: "Two" },
      { id: "8", front: "三 (さん)", back: "Three" },
      { id: "9", front: "四 (よん/し)", back: "Four" },
      { id: "10", front: "五 (ご)", back: "Five" },
    ]
  },
  {
    id: "music-theory",
    name: "Music Theory Basics",
    cards: [
      { id: "11", front: "What is a scale?", back: "A series of notes ordered by pitch" },
      { id: "12", front: "What is a chord?", back: "Three or more notes played together" },
      { id: "13", front: "What is rhythm?", back: "The pattern of sound and silence in time" },
      { id: "14", front: "What is tempo?", back: "The speed at which music is played" },
      { id: "15", front: "What is a key signature?", back: "Indicates which notes are sharp or flat" },
    ]
  }
]

// Extract YouTube video ID and/or playlist ID from various URL formats
function extractYouTubeInfo(url: string): { videoId: string | null; playlistId: string | null; type: 'video' | 'playlist' | null } {
  if (!url) return { videoId: null, playlistId: null, type: null }

  let videoId: string | null = null
  let playlistId: string | null = null

  // Extract playlist ID if present
  const playlistMatch = url.match(/[?&]list=([^&]+)/)
  if (playlistMatch) {
    playlistId = playlistMatch[1]
  }

  // Check if this is a playlist-only URL
  if (url.includes('/playlist?') && playlistId) {
    return { videoId: null, playlistId, type: 'playlist' }
  }

  // Regular YouTube URLs: https://www.youtube.com/watch?v=VIDEO_ID
  const standardMatch = url.match(/[?&]v=([^&]+)/)
  if (standardMatch) {
    videoId = standardMatch[1]
  }

  // Short YouTube URLs: https://youtu.be/VIDEO_ID
  if (!videoId) {
    const shortMatch = url.match(/youtu\.be\/([^?]+)/)
    if (shortMatch) videoId = shortMatch[1]
  }

  // Embedded URLs: https://www.youtube.com/embed/VIDEO_ID
  if (!videoId) {
    const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/)
    if (embedMatch) videoId = embedMatch[1]
  }

  // If it's just the video ID (11 characters)
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    videoId = url.trim()
  }

  // Determine type
  let type: 'video' | 'playlist' | null = null
  if (playlistId && videoId) {
    type = 'playlist' // Video within a playlist
  } else if (videoId) {
    type = 'video'
  } else if (playlistId) {
    type = 'playlist'
  }

  return { videoId, playlistId, type }
}

export function MediaPlayer() {
  const [url, setUrl] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [contentType, setContentType] = useState<'video' | 'playlist' | null>(null)
  const [selectedDeckId, setSelectedDeckId] = useState<string>(mockDecks[0].id)
  const [showingFlashcard, setShowingFlashcard] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showCardBack, setShowCardBack] = useState(false)
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false)
  const [frontDuration, setFrontDuration] = useState([5])
  const [backDuration, setBackDuration] = useState([5])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [interactionMode, setInteractionMode] = useState(false)
  const playerRef = useRef<any>(null)
  const flashcardTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const interactionModeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handlePlay = () => {
    const info = extractYouTubeInfo(url)

    // Only allow playlists
    if (info.playlistId) {
      setVideoId(info.videoId)
      setPlaylistId(info.playlistId)
      setContentType('playlist')
      setIsPlaying(true)
      setHasStartedPlaying(false) // Reset flag on new playback
    } else {
      // Not a playlist - show error
      setVideoId(null)
      setPlaylistId(null)
      setContentType(null)
      setIsPlaying(true) // Set to true to show error message
    }
  }

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target
  }

  const showFlashcard = () => {
    const selectedDeck = mockDecks.find(d => d.id === selectedDeckId)
    if (!selectedDeck || selectedDeck.cards.length === 0) return

    // Pause the player
    if (playerRef.current) {
      playerRef.current.pauseVideo()
    }

    // Show flashcard front side
    setShowingFlashcard(true)
    setShowCardBack(false)

    // After front duration, show back side
    flashcardTimerRef.current = setTimeout(() => {
      setShowCardBack(true)

      // After back duration, hide flashcard and play next video
      flashcardTimerRef.current = setTimeout(() => {
        setShowingFlashcard(false)
        setShowCardBack(false)

        // Move to next card
        setCurrentCardIndex((prev) => (prev + 1) % selectedDeck.cards.length)

        // Resume playback
        if (playerRef.current) {
          playerRef.current.playVideo()
        }
      }, backDuration[0] * 1000)
    }, frontDuration[0] * 1000)
  }

  const toggleCardSide = () => {
    setShowCardBack((prev) => !prev)
  }

  const getCurrentCard = () => {
    const selectedDeck = mockDecks.find(d => d.id === selectedDeckId)
    if (!selectedDeck || selectedDeck.cards.length === 0) return null
    return selectedDeck.cards[currentCardIndex]
  }

  // Handle entering interaction mode
  const enterInteractionMode = () => {
    setInteractionMode(true)

    // Clear existing timer if any
    if (interactionModeTimerRef.current) {
      clearTimeout(interactionModeTimerRef.current)
    }

    // Set timer to exit interaction mode after 10 seconds
    interactionModeTimerRef.current = setTimeout(() => {
      setInteractionMode(false)
    }, 10000)
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (flashcardTimerRef.current) {
        clearTimeout(flashcardTimerRef.current)
      }
      if (interactionModeTimerRef.current) {
        clearTimeout(interactionModeTimerRef.current)
      }
    }
  }, [])

  // Handle fullscreen changes (e.g., when user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle "f" key when player is active and not typing in an input
      if (
        event.key === 'f' &&
        isPlaying &&
        (videoId || playlistId) &&
        event.target instanceof HTMLElement &&
        !['INPUT', 'TEXTAREA'].includes(event.target.tagName)
      ) {
        event.preventDefault()
        toggleFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPlaying, videoId, playlistId])

  const onPlayerStateChange = (event: any) => {
    console.log('Player state:', event.data)
    // YouTube player states:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)

    if (event.data === 1) {
      // Video is playing - mark that we've started
      setHasStartedPlaying(true)
    } else if (event.data === -1 && hasStartedPlaying && !interactionMode) {
      // Unstarted state after we've been playing = transition between videos in playlist
      // Only show flashcard if not in interaction mode (prevents showing on manual video changes)
      showFlashcard()
    }
  }

  const toggleFullscreen = async () => {
    if (!fullscreenContainerRef.current) return

    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await fullscreenContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        // Exit fullscreen
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }


  // Build player options dynamically based on content type
  const opts: YouTubeProps['opts'] = {
    height: isFullscreen ? '100%' : '480',
    width: '100%',
    playerVars: {
      autoplay: 1,
      fs: 0, // Disable YouTube's native fullscreen button
      ...(playlistId && { list: playlistId }),
      ...(playlistId && !videoId && { listType: 'playlist' }),
    },
  }

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col" : "max-w-4xl mx-auto space-y-6"}>
      {/* Header - only show when not in fullscreen */}
      {!isFullscreen && (
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Flashcard Playlist Player</h2>
          <p className="text-muted-foreground">{"Learn with flashcards between each video in your playlist"}</p>
        </div>
      )}

      {/* Configuration Card - only show when not in fullscreen */}
      {!isFullscreen && (
        <Card>
          <CardHeader>
            <CardTitle>{"Playback Configuration"}</CardTitle>
            <CardDescription>{"Choose a YouTube playlist and flashcard deck to begin learning"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">YouTube Playlist URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{"Enter a YouTube playlist URL (must contain list=...)"}</p>
            </div>

            {/* Deck Selection */}
            <div className="space-y-2">
              <Label htmlFor="deck">Flashcard Deck</Label>
              <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                <SelectTrigger id="deck">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {`Flashcards will appear between videos (${mockDecks.find(d => d.id === selectedDeckId)?.cards.length || 0} cards)`}
              </p>
            </div>

            {/* Front Side Duration */}
            <div className="space-y-2">
              <Label htmlFor="front-duration">
                Front Side Duration: {frontDuration[0]} seconds
              </Label>
              <Slider
                id="front-duration"
                value={frontDuration}
                onValueChange={setFrontDuration}
                min={2}
                max={15}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                How long the question/front side is shown
              </p>
            </div>

            {/* Back Side Duration */}
            <div className="space-y-2">
              <Label htmlFor="back-duration">
                Back Side Duration: {backDuration[0]} seconds
              </Label>
              <Slider
                id="back-duration"
                value={backDuration}
                onValueChange={setBackDuration}
                min={2}
                max={15}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                How long the answer/back side is shown before the next video plays
              </p>
            </div>

            {/* Play Button */}
            <div className="pt-4 flex gap-2">
              <Button onClick={handlePlay} size="lg" className="flex-1 md:flex-none" disabled={!url}>
                <Play className="mr-2 h-5 w-5" />
                {"Play"}
              </Button>
              {isPlaying && (videoId || playlistId) && (
                <Button onClick={toggleFullscreen} size="lg" variant="outline" title="Enter Fullscreen">
                  <Maximize className="mr-2 h-5 w-5" />
                  Enter Fullscreen
                </Button>
              )}
            </div>

            {/* Error Message */}
            {isPlaying && !playlistId && (
              <div className="mt-6 p-6 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-lg font-semibold text-destructive text-center">{"Playlist Required"}</p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {"This player only works with YouTube playlists. Flashcards appear between each video in the playlist."}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-3 font-mono bg-muted p-2 rounded">
                  {"Example: https://www.youtube.com/playlist?list=PLxxxxxx"}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {"The URL must contain \"list=\" parameter"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* YouTube Player - outside Card, shown in both modes */}
      {isPlaying && (videoId || playlistId) && (
        <div
          ref={fullscreenContainerRef}
          className={isFullscreen ? "flex-1 relative bg-black" : "rounded-lg overflow-hidden relative"}
        >
          {/* Fullscreen exit button */}
          {isFullscreen && (
            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
              <Button
                onClick={toggleFullscreen}
                size="lg"
                variant="secondary"
                className="opacity-80 hover:opacity-100 transition-all duration-300"
              >
                <Minimize className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className={isFullscreen ? "h-full w-full" : ""}>
            <YouTube
              videoId={videoId || undefined}
              opts={opts}
              onReady={onReady}
              onStateChange={onPlayerStateChange}
              className={isFullscreen ? "h-full w-full" : "w-full aspect-video"}
            />
          </div>

          {/* Interaction Overlay - only show when NOT in interaction mode and NOT showing flashcard */}
          {!interactionMode && !showingFlashcard && (
            <div
              className="absolute inset-0 z-10 cursor-pointer transition-colors hover:bg-gray-500/10"
              onClick={enterInteractionMode}
              title="Click to interact with player controls"
            />
          )}

          {/* Flashcard Overlay */}
          {showingFlashcard && getCurrentCard() && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 border-2 border-gray-200 dark:border-gray-700">
                <div className="text-center space-y-6">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {showCardBack ? "Answer" : "Question"}
                  </div>
                  <div className="text-4xl font-bold min-h-[100px] flex items-center justify-center text-gray-900 dark:text-gray-100">
                    {showCardBack ? getCurrentCard()?.back : getCurrentCard()?.front}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {showCardBack ? `Answer will be shown for ${backDuration[0]}s` : `Question will be shown for ${frontDuration[0]}s`}
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Card {currentCardIndex + 1} of {mockDecks.find(d => d.id === selectedDeckId)?.cards.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
