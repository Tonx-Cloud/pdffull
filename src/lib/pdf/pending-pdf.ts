// Tiny helper to persist a generated PDF Blob across an auth redirect (signup/login).
// Uses native IndexedDB (no extra dependency).

const DB_NAME = "pdffull";
const STORE = "pending";
const KEY = "pdf";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePendingPdf(blob: Blob, filename: string, pageCount: number): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ blob, filename, pageCount, savedAt: Date.now() }, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export interface PendingPdf {
  blob: Blob;
  filename: string;
  pageCount: number;
  savedAt: number;
}

export async function loadPendingPdf(): Promise<PendingPdf | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  const result = await new Promise<PendingPdf | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as PendingPdf | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  // Ignorar PDFs antigos (>1h) para evitar restaurar dados velhos
  if (result && Date.now() - result.savedAt > 60 * 60 * 1000) {
    await clearPendingPdf();
    return null;
  }
  return result;
}

export async function clearPendingPdf(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
