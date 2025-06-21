import { useState, useEffect } from "react";
import { FixedSizeList as List } from 'react-window';
import "../css/SongsList.css";
// import missing from "../assets/missing.png";
import missing from "../../public/osu!player logo.png"

function SongsList({ searchQuery, songs, onSongSelect, currentSong }) {
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const ROW_HEIGHT = 64; 
    const GAP = 10; 
    const ITEM_HEIGHT = ROW_HEIGHT + GAP;

    const Row = ({ index, style }) => {
        const song = filteredSongs[index];

        return (
            <div style={{ ...style }}>
                <div
                    className={`song-item ${currentSong === song ? "selected" : ""}`}
                    onClick={() => onSongSelect(song)}
                >
                    <img src={song.cover || missing} alt={song.cover ? song.title : "?"} className="song-cover" />
                    <div className="song-info">
                        <p className="song-title">{song.title}</p>
                        <p className="song-details">{song.artist}</p>
                    </div>
                </div>

                {index < filteredSongs.length - 1 && (
                    <div
                        style={{
                            height: "10px",
                            display: "flex",
                            alignItems: "center", 
                        }}
                    >
                        <div
                            style={{
                                height: '1px',
                                width: '100%',
                                backgroundColor: 'rgba(128, 128, 128, 0.25)', 
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="songs-list">
            {filteredSongs.length > 0 ? (
                <List
                    height={windowHeight} 
                    itemCount={filteredSongs.length}
                    itemSize={ITEM_HEIGHT} 
                    width={"100%"} 
                    className="custom-scrollbar"
                >
                    {Row}
                </List>
            ) : (
                <p className="no-songs">No songs found.</p>
            )}
        </div>
    );
}

export default SongsList;