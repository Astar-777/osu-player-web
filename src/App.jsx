import { useState, useEffect, useRef } from "react";
import './App.css'
import Navbar from "./components/Navbar";
import SongsList from "./components/SongsList";
import Player from "./components/Player"
import { getSavedFolderHandle, saveFolderHandle, getCachedSongs } from "./helpers/dbHelper.js"
import { importAndResolveSongs } from "./helpers/appHelper.js"

function App() {
	const [searchQuery, setSearchQuery] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [loadingSongs, setLoadingSongs] = useState(false);
	const [songsList, setSongsList] = useState([]);
	const [currentSong, setCurrentSong] = useState(null);
	const audioRef = useRef(null);

	const handleSongSelect = (song) => {
		setCurrentSong(song);
		if (audioRef.current) {
			audioRef.current.src = song.audio;
			audioRef.current.play();
		}
	};

	useEffect(() => {
		async function fetchCachedSongs() {
			setLoadingSongs(true);

			const cachedSongs = await loadCachedSongs();
			const savedFolderHandle = await getSavedFolderHandle();

			if (!savedFolderHandle) {
				console.warn("No saved folder handle found");
				setShowModal(true);
				setLoadingSongs(false);
				return;
			}

			const updatedSongs = await Promise.all(cachedSongs.map(async (song) => {
				try {
					const folderHandle = await savedFolderHandle.getDirectoryHandle(song.audio.split("/")[0]);
					const audioHandle = await folderHandle.getFileHandle(song.audio.split("/")[1]);
					const coverHandle = song.cover ? await folderHandle.getFileHandle(song.cover.split("/")[1]) : null;

					const audioFile = await audioHandle.getFile();
					const audioURL = URL.createObjectURL(audioFile);

					let coverURL = null;
					if (coverHandle) {
						const coverFile = await coverHandle.getFile();
						coverURL = URL.createObjectURL(coverFile);
					}

					return { ...song, audio: audioURL, cover: coverURL };
				} catch (error) {
					console.warn("Error loading file for:", song.title, error);
					return { ...song, audio: null, cover: null };
				}
			}));

			const sortedSongs = updatedSongs.sort((a, b) => a.title.localeCompare(b.title));
			setSongsList(sortedSongs);
			setLoadingSongs(false);
		}
		fetchCachedSongs();
	}, []);

	const handleImportClick = async () => {
		try {
			const dirHandle = await window.showDirectoryPicker();
			setIsImporting(true);

			await saveFolderHandle(dirHandle);

			const songs = await importAndResolveSongs(dirHandle);
			setSongsList(songs);

			setIsImporting(false);
			setShowModal(false);
		} catch (error) {
			console.error("Folder selection canceled or failed", error);
		}
	};

	return (
		<div className="osu-player">
			{loadingSongs && (
				<div className="modal">
					<div className="modal-content">
						<p>Loading songs...</p>
					</div>
				</div>
			)}
			{showModal && (
				<div className="modal">
					<div className="modal-content">
						{!isImporting ? (
							<>
								<p>Please select your osu! songs folder.</p>
								<button className="import-button" onClick={handleImportClick}>
									Import
								</button>
							</>
						) : (
							<p>Importing...</p>
						)}
					</div>
				</div>
			)}
			<Navbar setSearchQuery={setSearchQuery} songs={songsList}></Navbar>
			<SongsList searchQuery={searchQuery} songs={songsList} onSongSelect={handleSongSelect} currentSong={currentSong}></SongsList>
			<Player currentSong={currentSong} setCurrentSong={setCurrentSong} audioRef={audioRef} songs={songsList}></Player>
			<audio ref={audioRef}></audio>
		</div>
	);
}

export default App;