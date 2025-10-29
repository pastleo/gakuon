"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Play } from "lucide-react"

export function MediaPlayer() {
  const [url, setUrl] = useState("")
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0")
  const [volume, setVolume] = useState([80])
  const [showWip, setShowWip] = useState(false)

  const handlePlay = () => {
    setShowWip(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Media Player</h2>
        <p className="text-muted-foreground">{"Enter a media URL and configure playback settings"}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{"Playback Configuration"}</CardTitle>
          <CardDescription>{"Set up your media source and playback preferences"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Media URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/video.mp4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{"Enter a direct link to a video or audio file"}</p>
          </div>

          {/* Playback Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Playback Speed */}
            <div className="space-y-2">
              <Label htmlFor="speed">Playback Speed</Label>
              <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                <SelectTrigger id="speed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">{"0.5x"}</SelectItem>
                  <SelectItem value="0.75">{"0.75x"}</SelectItem>
                  <SelectItem value="1.0">{"1.0x (Normal)"}</SelectItem>
                  <SelectItem value="1.25">{"1.25x"}</SelectItem>
                  <SelectItem value="1.5">{"1.5x"}</SelectItem>
                  <SelectItem value="2.0">{"2.0x"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label htmlFor="volume">
                {"Volume: "}
                {volume[0]}
                {"%"}
              </Label>
              <Slider id="volume" value={volume} onValueChange={setVolume} max={100} step={1} className="mt-2" />
            </div>
          </div>

          {/* Play Button */}
          <div className="pt-4">
            <Button onClick={handlePlay} size="lg" className="w-full md:w-auto" disabled={!url}>
              <Play className="mr-2 h-5 w-5" />
              {"Play"}
            </Button>
          </div>

          {/* WIP Message */}
          {showWip && (
            <div className="mt-6 p-6 bg-accent/10 border border-accent rounded-lg">
              <p className="text-lg font-semibold text-accent text-center">{"WIP - Work in Progress"}</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {"Media playback functionality is currently under development"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
