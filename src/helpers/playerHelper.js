import { getShuffleState, saveShuffleState, getVolumeValue, saveVolumeValue } from "./dbHelper";

export const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};


export async function loadPlayerSettings({ setShuffle, setVolume }) {
    const shuffleState = await getShuffleState();
    if (typeof shuffleState === "boolean") { 
        setShuffle(shuffleState);
    }
    
    const volumeValue = await getVolumeValue();
    if (typeof volumeValue === "number") { 
        setVolume(volumeValue);
    };
};

export const persistPlayerSettings = ({ shuffle, volume }) => {
    saveShuffleState(shuffle);
    saveVolumeValue(volume);
};

export const skipLogic = ({ shuffleRef, direction, currentSong, audioRef, songs }) => {
    if (!currentSong || !audioRef.current) return;
    
    const currentIndex = songs.findIndex(song => song === currentSong);
    let newIndex;

    if (shuffleRef.current) {
        if (direction === "prev") {
            if (audioRef.current.currentTime> 3) {
                audioRef.current.currentTime = 0;
                return;
            }
        }

        const otherSongs = songs.filter(song => song !== currentSong);
        const nextSong = otherSongs[Math.floor(Math.random()*otherSongs.length)];
        newIndex = songs.findIndex(song => song === nextSong)
    } else {
        if (direction === "prev") {
            if (audioRef.current.currentTime > 3) {
                audioRef.current.currentTime = 0;
                return;
            }
            newIndex = currentIndex - 1;
        } else {
            newIndex = currentIndex + 1;
        }
    }

    if (newIndex >= songs.length) newIndex = 0; // Loop to first song
    if (newIndex < 0) newIndex = songs.length - 1; // Loop to last song

    return newIndex;
}