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
        console.log(`${DB_NAME} deleted successfully!`);
    };
    request.onerror = () => {
        console.error(`Failed to delete ${DB_NAME}.`);
    };
    request.onblocked = () => {
        console.warn(`${DB_NAME} deletion is blocked. Close all tabs using it and try again.`);
    };
};


export async function saveSongs(songs) {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
    console.log("Cleared previous songs");
    songs.forEach(song => store.put(song));
    console.log("Saved songs")
    return transaction.complete;
}

export async function loadCachedSongs() {
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