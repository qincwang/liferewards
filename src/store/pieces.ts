export type PieceDifficulty = "beginner" | "intermediate" | "advanced";
export type PieceInstrument = "electric_guitar" | "classical_guitar" | "drums" | "piano" | "other";

export interface PieceLog {
  id: string;
  title: string;
  composer?: string;
  instrument: PieceInstrument;
  difficulty: PieceDifficulty;
  masteredDate: string; // YYYY-MM-DD
  coverUrl?: string;
  addedAt: string;
}

const PIECES_KEY = "liferewards_pieces";

export function loadPieces(): PieceLog[] {
  try {
    const raw = localStorage.getItem(PIECES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePieces(pieces: PieceLog[]): void {
  localStorage.setItem(PIECES_KEY, JSON.stringify(pieces));
}

export function addPiece(piece: PieceLog): PieceLog[] {
  const pieces = loadPieces();
  pieces.push(piece);
  savePieces(pieces);
  return pieces;
}

export function deletePiece(id: string): PieceLog[] {
  const pieces = loadPieces().filter((p) => p.id !== id);
  savePieces(pieces);
  return pieces;
}

// ─── Cover fetch ──────────────────────────────────────────────────────────────

const INSTRUMENT_WIKI_PAGES: Record<PieceInstrument, string[]> = {
  electric_guitar:  ["Jimi_Hendrix", "Eric_Clapton", "Jimmy_Page", "Chuck_Berry", "Eddie_Van_Halen", "Slash_(musician)"],
  classical_guitar: ["Andr%C3%A9s_Segovia", "John_Williams_(guitarist)", "Julian_Bream", "Narciso_Yepes", "P%C3%A1vel_Stakhov"],
  drums:            ["John_Bonham", "Neil_Peart", "Keith_Moon", "Ringo_Starr", "Buddy_Rich"],
  piano:            ["Lang_Lang", "Glenn_Gould", "Vladimir_Horowitz", "Yuja_Wang", "Arthur_Rubinstein"],
  other:            ["Louis_Armstrong", "Miles_Davis", "Yo-Yo_Ma", "Itzhak_Perlman", "Wynton_Marsalis"],
};

export async function fetchPieceCover(instrument: PieceInstrument): Promise<string | undefined> {
  const pages = INSTRUMENT_WIKI_PAGES[instrument];
  const page = pages[Math.floor(Math.random() * pages.length)];
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${page}`);
    if (res.ok) {
      const data = await res.json();
      const url: string | undefined = data?.thumbnail?.source;
      if (url) return url.replace(/\/\d+px-/, "/400px-");
    }
  } catch { /* give up */ }
  return undefined;
}
