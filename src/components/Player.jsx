import { useState, useEffect, useRef } from "react";
import { IoPlaySharp, IoPauseSharp, IoPlaySkipBack, IoPlaySkipForward, IoVolumeHigh, IoVolumeMute, IoShuffle } from "react-icons/io5";
import { formatTime, loadPlayerSettings, persistPlayerSettings, skipLogic } from "../helpers/playerHelper.js"
import missing from "../assets/missing.png"
import "../css/Player.css";

function Player({ currentSong, setCurrentSong, audioRef, songs }) {
    const [progress, setProgress] = useState(0);
    const [shuffle, setShuffle] = useState(false);
    const [volume, setVolume] = useState(100);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [prevVolume, setPrevVolume] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    const shuffleRef = useRef(shuffle);

    const handleVolumeChange = (e) => setVolume(Number(e.target.value));

    const toggleMute = () => {
        if (volume === 0) {
            setVolume(prevVolume); 
        } else {
            setPrevVolume(volume);
            setVolume(0);
        }
    };

    const toggleShuffle = () => setShuffle(prev => !prev);

    const handlePlayPause = () => {
        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    };

    const handleSkip = (direction) => {
        const index = skipLogic({ shuffleRef, direction, currentSong, audioRef, songs })
        if (index === undefined) return;

        const nextSong = songs[index];
        setCurrentSong(nextSong)

        audioRef.current.src = nextSong.audio;
        audioRef.current.play();
    };

    const handleSeek = (e) => {
        const newTime = (e.target.value / 100) * duration;
        setProgress(e.target.value);
        audioRef.current.currentTime = newTime;
        audioRef.current.play();
    };

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const updatePlayState = () => setIsPlaying(!audio.paused);
        const updateTime = () => {
            setElapsedTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };
        const setAudioDuration = () => setDuration(audio.duration);

        audio.addEventListener("play", updatePlayState);
        audio.addEventListener("pause", updatePlayState);
        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", setAudioDuration);

        return () => {
            audio.removeEventListener("play", updatePlayState);
            audio.removeEventListener("pause", updatePlayState);
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
        };
    }, [audioRef]);

    useEffect(() => {
        const handleSongEnd = () => {
            let nextSong;

            if (shuffleRef.current) {
                const otherSongs = songs.filter(song => song !== currentSong);
                nextSong = otherSongs[Math.floor(Math.random()*otherSongs.length)];
            } else {
                const currentIndex = songs.findIndex(song => song === currentSong);
                const nextIndex = (currentIndex + 1) % songs.length; // Loop to first song if at the end
                nextSong = songs[nextIndex];
            }

            setCurrentSong(nextSong);
    
            if (audioRef.current) {
                audioRef.current.src = nextSong.audio;
                audioRef.current.play().catch(err => console.log("Error in auto-next play:", err));
            }
        };
    
        if (audioRef.current) {
            audioRef.current.addEventListener("ended", handleSongEnd);
        }
    
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener("ended", handleSongEnd);
            }
        };
    }, [currentSong, songs, setCurrentSong]);

    useEffect(() => {
        (async () =>{
            await loadPlayerSettings({ setShuffle, setVolume });
            setSettingsLoaded(true);
        })();
    }, []);

    // being used for shuffleRef update too
    useEffect(() => {
        if (settingsLoaded) {
            persistPlayerSettings({ shuffle, volume });
            
            shuffleRef.current = shuffle;
        }
    }, [shuffle, volume, settingsLoaded]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    useEffect(() => {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong?.title || "Unknown",
                artist: currentSong?.artist || "Unknown",
                artwork: [{ src: currentSong?.cover || missing, sizes: "512x512", type: "image/png" }]
            });
    
            navigator.mediaSession.setActionHandler("play", () => {
                audioRef.current.play();
                setIsPlaying(true);
            });
    
            navigator.mediaSession.setActionHandler("pause", () => {
                audioRef.current.pause();
                setIsPlaying(false);
            });
    
            navigator.mediaSession.setActionHandler("previoustrack", () => handleSkip("prev"));
            navigator.mediaSession.setActionHandler("nexttrack", () => handleSkip("next"));
        }
    }, [currentSong]);

    return (
        <div className="player">
            <div className="player-top">
                <div className="player-info">
                    <IoShuffle className={`shuffle-button ${shuffle === true ? "toggled": ""}`} size={21} onClick={toggleShuffle}></IoShuffle>
                    {volume === 0 ? <IoVolumeMute className="volume-button" size={20} onClick={toggleMute}/> : <IoVolumeHigh className="volume-button" size={20} onClick={toggleMute}/>}
                    <input type="range" className="volume-slider" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ "--volume": `${volume}%` }} />
                </div>

                <p className="playing-song-title">{currentSong ? currentSong.title : "No song playing..."}</p>
            </div>

            <div className="player-bottom">
                <div className="player-controls">
                    <button className="player-button skip-control" onClick={() => handleSkip("prev")}><IoPlaySkipBack size={15} /></button>
                    <button className="player-button play-pause" onClick={handlePlayPause}>
                        {isPlaying ? <IoPauseSharp size={17} /> : <IoPlaySharp size={17} />}
                    </button>
                    <button className="player-button skip-control" onClick={() => handleSkip("next")}><IoPlaySkipForward size={15} /></button>
                </div>

                <div className="song-duration">
                    <input type="range" className="progress-bar" min="0" max="100" value={isNaN(progress) ? 0 : progress} onChange={handleSeek} style={{ "--progress": `${progress}%` }} />
                    <span className="time">{formatTime(elapsedTime)} / {formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}

export default Player;