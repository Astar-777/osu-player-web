import { saveSongs } from "./dbHelper";

export async function importAndResolveSongs(dirHandle) {
	const excludePattern = /^(drum|normal|soft)-hit(clap|finish|normal|whistle|sliderslide|slidertick|sliderwhistle)(\d*)?(\.\w+)?$/i;
	const ignoreFiles = ['failsound.ogg', 'failsound.mp3', 'combobreak.ogg', 'combobreak.mp3'];
	const preferredCovers = ["cover.jpg", "bg.jpg", "background.jpg", "cover.png", "bg.png", "background.png", "cover.jpeg", "bg.jpeg", "background.jpeg"];

	const songs = [];

	for await (const folderHandle of dirHandle.values()) {
		if (folderHandle.kind !== 'directory') continue;

		const folderName = folderHandle.name;
		const match = folderName.match(/^(\d+\s)?(.+?)\s*-\s*(.+)$/);
		if (!match) continue;

		const [, , artist, title] = match;

		let coverPath = null;
		let possibleCovers = [];
		let audioPath = null;

		for await (const fileHandle of folderHandle.values()) {
			const fileName = fileHandle.name.toLowerCase();

			if (ignoreFiles.includes(fileName) || excludePattern.test(fileName)) continue;

			if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png")) {
				possibleCovers.push(fileHandle.name);
			}

			if (!audioPath && (fileName.endsWith(".mp3") || fileName.endsWith(".ogg"))) {
				audioPath = `${folderHandle.name}/${fileHandle.name}`;
			}
		}

		for (const preferred of preferredCovers) {
			if (possibleCovers.includes(preferred)) {
				coverPath = `${folderHandle.name}/${preferred}`;
				break;
			}
		}

		if (!coverPath && possibleCovers.length > 0) {
			coverPath = `${folderHandle.name}/${possibleCovers[0]}`;
		}

		if (audioPath) {
			songs.push({
				id: crypto.randomUUID(),
				title,
				artist,
				cover: coverPath,
				audio: audioPath,
			});
		}
	}

    await saveSongs(songs);

    const resolvedSongs = await Promise.all(songs.map(async (song) => {
        try {
            const folderHandle = await dirHandle.getDirectoryHandle(song.audio.split("/")[0]);
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
            console.error("Error loading file for:", song.title, error);
            return { ...song, audio: null, cover: null };
        }
    }));

    return resolvedSongs.sort((a, b) => a.title.localeCompare(b.title));
}