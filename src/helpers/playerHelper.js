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

export const resolveNextSong = ({
    shuffleRef,
    direction,
    currentSong,
    audioRef,
    songs,
    playHistory,
    playHistoryPointer,
}) => {
    if (!currentSong || !audioRef.current) return;


    let newHistory = [...playHistory];
    let newPointer = playHistoryPointer;
    let nextIndex = null;

    const currentIndex = songs.findIndex(song => song === currentSong);
    if (currentIndex === -1) return;

    if (direction === "prev") {
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        if (playHistoryPointer > 0) {
            newPointer = playHistoryPointer - 1;
            nextIndex = newHistory[newPointer];
            console.log("prev", newHistory)
            console.log("prev", newPointer)
            return { nextIndex, newHistory, newPointer };
        } else {
            // return; // No song to go back to
            audioRef.current.currentTime = 0;
            return;
        }
    }

    if (direction === "next") {
        if (playHistoryPointer < playHistory.length - 1) {
            // Go forward in history
            newPointer = playHistoryPointer + 1;
            nextIndex = newHistory[newPointer];
            console.log("next in history", newHistory)
            console.log("next in history", newPointer)
            return { nextIndex, newHistory, newPointer };
        } else {
            if (shuffleRef.current) {
                const otherSongs = songs.filter(song => song !== currentSong);
                const generatedSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
                nextIndex = songs.findIndex(song => song === generatedSong);    
            } else {
                nextIndex = currentIndex + 1;
                if (nextIndex >= songs.length) nextIndex = 0;
            }
            
            newHistory.push(nextIndex);
            newPointer = newHistory.length - 1;
            console.log("next new", newHistory)
            console.log("next new", newPointer)
            return { nextIndex, newHistory, newPointer };
        }
    }
};