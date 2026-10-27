
import React, { useState, useRef, useEffect } from 'react';
import { SkipBack, SkipForward, Play, Pause, Heart, Volume, Volume2 } from 'lucide-react';
import { getSongs } from './musicAPI.js';
import './MusicPlayer.css';

function MusicPlayer() {
    const [songInfo, setSongInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isLiked, setIsLiked] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setPlaying] = useState(false);
    const audioRef = useRef(null);
    const [currentSong, setCurrentSong] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(60);

    useEffect(() => {
        async function loadSongs() {
            try {
                const songs = await getSongs();
                setSongInfo(songs);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadSongs();
    }, []);

    useEffect(() => {
        if (!loading && audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [loading, volume]);

    useEffect(() => {
        if (!loading && isPlaying && audioRef.current) {
            audioRef.current.play().catch(() => {
                setPlaying(false);
            });
        }
    }, [currentSong, loading]);

    const handleVolume = (e) => {
        const userVolume = Number(e.target.value);
        setVolume(userVolume);
    };

    const handleLiked = () => {
        setIsLiked(prev => !prev);
    };

    const handleSongFront = () => {
        if (songInfo.length === 0) return;

        setCurrentSong(prev => (prev + 1) % songInfo.length);
        setCurrentTime(0);
        setDuration(0);
        setPlaying(true);
    };

    const handleSongBack = () => {
        if (songInfo.length === 0) return;

        setCurrentSong(prev => (prev - 1 + songInfo.length) % songInfo.length);
        setCurrentTime(0);
        setDuration(0);
        setPlaying(true);
    };

    const handlePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {
                setPlaying(false);
            });
        }
    };

    const handleDuration = (e) => {
        setDuration(e.target.duration);
    };

    const handleTimeUpdate = (e) => {
        setCurrentTime(e.target.currentTime);
    };

    const handleSeek = (e) => {
        const newTime = Number(e.target.value);

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) return "00:00";

        const time = Math.max(0, seconds);
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);

        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) {
        return <p>Loading songs...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (songInfo.length === 0) {
        return <p>No songs available.</p>;
    }

    return (
        <div className="layout">

            <h1 className="header">Now Playing...</h1>

            <div className="heart-song">
                <button className="heartBtn" onClick={handleLiked}>
                    <Heart fill={isLiked ? "grey" : "none"} />
                </button>
            </div>

            <audio
                ref={audioRef}
                src={songInfo[currentSong].audio}
                onLoadedMetadata={handleDuration}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleSongFront}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />

            <img
                src={songInfo[currentSong].image}
                className={isPlaying ? "bob-animation" : "bob-animation-stop"}
                alt={songInfo[currentSong].name}
            />

            <div className="song-Info">
                <p className="name">{songInfo[currentSong].name}</p>
                <p className="artist">{songInfo[currentSong].artist}</p>
            </div>

            <div className="volume">
                <p className="volume1"><Volume /></p>

                <input
                    className="v"
                    type="range"
                    onChange={handleVolume}
                    max="100"
                    min="0"
                    value={volume}
                />

                <p className="volume2"><Volume2 /></p>
            </div>

            <div>
                <div className="song-times">
                    <p>{formatTime(currentTime)}</p>
                    <p>-{formatTime(duration - currentTime)}</p>
                </div>

                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={Math.min(currentTime, duration || 0)}
                    className={isPlaying ? "slider-playing" : "slider"}
                    onChange={handleSeek}
                />
            </div>

            <div className="change-songs">
                <button className="front" onClick={handleSongBack}>
                    <SkipBack />
                </button>

                <button className="controls" onClick={handlePlay}>
                    {isPlaying ? <Pause /> : <Play />}
                </button>

                <button className="front" onClick={handleSongFront}>
                    <SkipForward />
                </button>
            </div>

        </div>
    );
}

export default MusicPlayer;
