export const DAY_NOTE_KEY_PREFIX = 'swami_note_';

export type DayNoteErrorReason = 'unavailable' | 'quota' | 'unknown';

export type DayNoteSaveResult =
  | { ok: true }
  | { ok: false; reason: DayNoteErrorReason };

export interface DayNoteReadResult {
  note: string;
  storageAvailable: boolean;
}

export function getDayNoteKey(dateStr: string): string {
  return `${DAY_NOTE_KEY_PREFIX}${dateStr}`;
}

function getDefaultStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function classifyStorageError(err: unknown): DayNoteErrorReason {
  if (err && typeof err === 'object') {
    const maybeErr = err as { name?: string; code?: number };
    if (
      maybeErr.name === 'QuotaExceededError' ||
      maybeErr.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      maybeErr.code === 22 ||
      maybeErr.code === 1014
    ) {
      return 'quota';
    }
    if (maybeErr.name === 'SecurityError' || maybeErr.name === 'InvalidStateError') {
      return 'unavailable';
    }
  }
  return 'unknown';
}

/**
 * Safely checks if a non-empty personal note exists for a calendar date.
 * Never throws even when browser storage is blocked or denied.
 */
export function hasSavedDayNote(
  dateStr: string,
  storage?: Pick<Storage, 'getItem'> | null
): boolean {
  try {
    const store = storage !== undefined ? storage : getDefaultStorage();
    if (!store) return false;
    const raw = store.getItem(getDayNoteKey(dateStr));
    return Boolean(raw && raw.length > 0);
  } catch {
    return false;
  }
}

/**
 * Safely reads a saved personal note for a calendar date.
 */
export function readDayNote(
  dateStr: string,
  storage?: Pick<Storage, 'getItem'> | null
): DayNoteReadResult {
  try {
    const store = storage !== undefined ? storage : getDefaultStorage();
    if (!store) {
      return { note: '', storageAvailable: false };
    }
    const raw = store.getItem(getDayNoteKey(dateStr));
    return { note: raw || '', storageAvailable: true };
  } catch {
    return { note: '', storageAvailable: false };
  }
}

/**
 * Safely saves a personal note under the existing `swami_note_<YYYY-MM-DD>` key.
 * Returns a structured result so the UI can preserve typed text and show an accurate message on failure.
 */
export function saveDayNote(
  dateStr: string,
  note: string,
  storage?: Pick<Storage, 'setItem' | 'removeItem'> | null
): DayNoteSaveResult {
  try {
    const store = storage !== undefined ? storage : getDefaultStorage();
    if (!store) {
      return { ok: false, reason: 'unavailable' };
    }
    const key = getDayNoteKey(dateStr);
    if (note.length === 0 && typeof store.removeItem === 'function') {
      store.removeItem(key);
    } else {
      store.setItem(key, note);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: classifyStorageError(err) };
  }
}

export function getDayNoteErrorMessage(
  reason: DayNoteErrorReason,
  language: 'mr' | 'en'
): string {
  if (reason === 'quota') {
    return language === 'mr'
      ? 'डिव्हाइसवरील ब्राऊझर स्टोरेज भरले आहे, त्यामुळे नोंद सेव्ह करता आली नाही. तुमचा मजकूर येथे सुरक्षित आहे.'
      : 'Browser storage is full, so this note could not be saved. Your typed text is kept below.';
  }
  if (reason === 'unavailable') {
    return language === 'mr'
      ? 'या ब्राऊझरमध्ये लोकल स्टोरेज बंद किंवा अवरोधित आहे, त्यामुळे नोंद सेव्ह करता आली नाही. तुमचा मजकूर येथे सुरक्षित आहे.'
      : 'Browser storage is blocked or unavailable in this session, so this note could not be saved. Your typed text is kept below.';
  }
  return language === 'mr'
    ? 'नोंद सेव्ह करताना तांत्रिक अडचण आली. कृपया पुन्हा प्रयत्न करा — तुमचा मजकूर येथे सुरक्षित आहे.'
    : 'Could not save your note due to a browser storage error. Your typed text is still preserved below.';
}
