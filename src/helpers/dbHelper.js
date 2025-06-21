import { openDB } from "idb";

const DB_NAME = "OsuPlayerDB";
const STORE_NAME = "songs";

async function getDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings");
            }
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        },
    });
}

export async function deleteDB() { 
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
        // console.log(`${DB_NAME} deleted successfully!`);
    };
    request.onerror = () => {
        console.error(`Failed to delete ${DB_NAME}.`);
    };
    request.onblocked = () => {
        alert(`${DB_NAME} deletion is blocked. Close all tabs using it and try again.`)
        // console.warn(`${DB_NAME} deletion is blocked. Close all tabs using it and try again.`);
    };
};

export async function saveSongs(songs) {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
    songs.forEach(song => store.put(song));
    return transaction.complete;
}

export async function getCachedSongs() {
    try {
        const db = await getDB();
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const songs = await store.getAll(); 

        return songs || []; 
    } catch (error) {
        console.error("Error loading cached songs:", error);
        return []; 
    }
}

export async function clearCache() {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).clear();
    return transaction.complete;
}

export async function saveFolderHandle(folderHandle) {
    const db = await getDB();
    const tx = db.transaction("settings", "readwrite"); 
    const store = tx.objectStore("settings");
    await store.put(folderHandle, "folderHandle");
}

export async function getSavedFolderHandle() {
    const db = await getDB();
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    return store.get("folderHandle");
}

export async function saveShuffleState(shuffleState) {
    const db = await getDB();
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    await store.put(shuffleState, "shuffleState");
}

export async function getShuffleState() {
    const db = await getDB();
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    return store.get("shuffleState")
}

export async function saveVolumeValue(volumeValue) {
    const db = await getDB();
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    await store.put(volumeValue, "volumeValue");
}

export async function getVolumeValue() {
    const db = await getDB();
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    return store.get("volumeValue")
}

export async function saveCurrentSongIndex(currentSongIndex) {
    const db = await getDB();
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    await store.put(currentSongIndex, "currentSongIndex");
}

export async function getCurrentSongIndex() {
    const db = await getDB();
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    return store.get("currentSongIndex")
}