'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Image from 'next/image';

interface AudioPlayerProps {
    audioBlob?: Blob | File | null;
    audioUrl?: string;
}

export default function AudioPlayer({ audioBlob, audioUrl }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const objectUrlRef = useRef<string | null>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            const previousUrl = objectUrlRef.current;
            objectUrlRef.current = url;

            setTimeout(() => {
                setObjectUrl(url);
            }, 0);

            if (previousUrl) {
                setTimeout(() => {
                    URL.revokeObjectURL(previousUrl);
                }, 200);
            }
        } else {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            setTimeout(() => {
                setObjectUrl(null);
            }, 0);
        }

        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [audioBlob]);

    const audioSrc = audioUrl || objectUrl || '';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioSrc) return;

        const updateTime = () => {
            if (audio && !isNaN(audio.currentTime)) {
                setCurrentTime(audio.currentTime);
            }
        };
        const updateDuration = () => {
            if (audio && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        const handleError = () => {
            setIsPlaying(false);
        };
        const handleLoadedData = () => {
            updateDuration();
        };
        const handleTimeUpdate = () => {
            updateTime();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        audio.src = audioSrc;
        audio.load();

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [audioSrc]);

    const togglePlayPause = async () => {
        const audio = audioRef.current;
        if (!audio || !audioSrc) return;

        try {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                if (audio.readyState < 2) {
                    await audio.load();
                }
                await audio.play();
                setIsPlaying(true);
            }
        } catch {
            setIsPlaying(false);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !duration || duration === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const skipBackward = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    };

    const skipForward = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.min(duration, audio.currentTime + 10);
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-[#18181B] rounded-lg p-6">
            <div className="flex justify-center mb-2">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#27272A]">
                    <Image src="/caution.svg" alt="Audio Placeholder" width={32} height={32} />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#8A8A8A]">{formatTime(currentTime)}</span>
                    <span className="text-sm text-[#8A8A8A]">{formatTime(duration)}</span>
                </div>
                <div
                    className="w-full h-1 bg-[#27272A] rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-center gap-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={skipBackward}
                    className="cursor-pointer text-[#8A8A8A] hover:text-white hover:bg-transparent"
                    disabled={!audioSrc}
                >
                    <ChevronsLeft className="h-5 w-5" />
                </Button>

                <Button
                    type="button"
                    onClick={togglePlayPause}
                    className="cursor-pointer w-14 h-14 rounded-full bg-white text-[#1A1A1A] hover:bg-gray-200 flex items-center justify-center p-0"
                    disabled={!audioSrc}
                >
                    {isPlaying ? (
                        <Pause className="h-6 w-6 fill-current" />
                    ) : (
                        <Play className="h-6 w-6 fill-current ml-0.5" />
                    )}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={skipForward}
                    className="cursor-pointer text-[#8A8A8A] hover:text-white hover:bg-transparent"
                    disabled={!audioSrc}
                >
                    <ChevronsRight className="h-5 w-5" />
                </Button>
            </div>

            {audioSrc && (
                <audio
                    ref={audioRef}
                    src={audioSrc}
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={() => {
                        const audio = audioRef.current;
                        if (audio && audio.duration && !isNaN(audio.duration)) {
                            setDuration(audio.duration);
                        }
                    }}
                />
            )}
        </div>
    );
}
