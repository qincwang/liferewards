import { useState } from "react";
import { addPiece, deletePiece, fetchPieceCover } from "../store/pieces";
import type { PieceLog, PieceDifficulty, PieceInstrument } from "../store/pieces";

// ─── Meta ──────────────────────────────────────────────────────────────────────

const INSTRUMENT_META: Record<PieceInstrument, { label: string; icon: string; color: string; selected: string }> = {
  electric_guitar:  { label: "Electric",  icon: "🎸", color: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300", selected: "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950" },
  classical_guitar: { label: "Classical", icon: "🎼", color: "bg-amber-100  dark:bg-amber-950  text-amber-700  dark:text-amber-300",  selected: "ring-2 ring-amber-500  bg-amber-50  dark:bg-amber-950"  },
  drums:            { label: "Drums",     icon: "🥁", color: "bg-red-100    dark:bg-red-950    text-red-700    dark:text-red-300",    selected: "ring-2 ring-red-500    bg-red-50    dark:bg-red-950"    },
  piano:            { label: "Piano",     icon: "🎹", color: "bg-blue-100   dark:bg-blue-950   text-blue-700   dark:text-blue-300",   selected: "ring-2 ring-blue-500   bg-blue-50   dark:bg-blue-950"   },
  other:            { label: "Other",     icon: "🎵", color: "bg-gray-100   dark:bg-slate-800  text-gray-600   dark:text-slate-300",  selected: "ring-2 ring-gray-400   bg-gray-50   dark:bg-slate-800"  },
};

const DIFFICULTY_META: Record<PieceDifficulty, { label: string; icon: string; sublabel: string; selected: string }> = {
  beginner:     { label: "Beginner",     icon: "🌱", sublabel: "Entry level", selected: "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950" },
  intermediate: { label: "Intermediate", icon: "🔥", sublabel: "Takes work",  selected: "ring-2 ring-amber-500   bg-amber-50   dark:bg-amber-950"   },
  advanced:     { label: "Advanced",     icon: "💀", sublabel: "Demanding",   selected: "ring-2 ring-red-500     bg-red-50     dark:bg-red-950"     },
};

const INSTRUMENTS = Object.keys(INSTRUMENT_META) as PieceInstrument[];
const DIFFICULTIES = Object.keys(DIFFICULTY_META) as PieceDifficulty[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Add Form ─────────────────────────────────────────────────────────────────

interface AddFormProps {
  onAdd: (piece: PieceLog) => void;
}

function AddForm({ onAdd }: AddFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [instrument, setInstrument] = useState<PieceInstrument>("classical_guitar");
  const [difficulty, setDifficulty] = useState<PieceDifficulty>("intermediate");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const coverUrl = await fetchPieceCover(instrument);

    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      composer: composer.trim() || undefined,
      instrument,
      difficulty,
      masteredDate: date,
      coverUrl,
      addedAt: new Date().toISOString(),
    });

    setTitle("");
    setComposer("");
    setDifficulty("intermediate");
    setDate(today);
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-4"
    >
      <h2 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide">
        🎵 Add a Piece
      </h2>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
          Piece Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Asturias (Leyenda)"
          required
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Composer + Date row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            Composer <span className="font-normal text-gray-400 dark:text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder="e.g. Isaac Albéniz"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            Mastered Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Instrument picker */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
          Instrument
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {INSTRUMENTS.map((inst) => {
            const m = INSTRUMENT_META[inst];
            const active = instrument === inst;
            return (
              <button
                key={inst}
                type="button"
                onClick={() => setInstrument(inst)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${
                  active
                    ? `${m.selected} border-transparent`
                    : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                <span className={`text-[10px] font-semibold leading-tight text-center ${active ? "" : "text-gray-600 dark:text-slate-300"}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty picker */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
          Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((lvl) => {
            const m = DIFFICULTY_META[lvl];
            const active = difficulty === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                  active
                    ? `${m.selected} border-transparent`
                    : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <span className={`text-xs font-semibold ${active ? "" : "text-gray-600 dark:text-slate-300"}`}>
                  {m.label}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">{m.sublabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 text-white transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="animate-spin">⏳</span> Fetching cover…</>
        ) : (
          "Add to Repertoire"
        )}
      </button>
    </form>
  );
}

// ─── Piece Card ───────────────────────────────────────────────────────────────

interface PieceCardProps {
  piece: PieceLog;
  onDelete: (id: string) => void;
}

function PieceCard({ piece, onDelete }: PieceCardProps) {
  const inst = INSTRUMENT_META[piece.instrument];
  const diff = DIFFICULTY_META[piece.difficulty];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      {/* Cover / icon area */}
      <div className={`aspect-[2/3] flex flex-col items-center justify-center relative ${piece.coverUrl ? "" : inst.color}`}>
        {piece.coverUrl ? (
          <img
            src={piece.coverUrl}
            alt={piece.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span className="text-5xl select-none">{inst.icon}</span>
        )}
        {/* Instrument + difficulty badges */}
        <span className="absolute bottom-2 left-2 text-base bg-black/30 rounded-full px-1.5 py-0.5">
          {inst.icon}{diff.icon}
        </span>
        {/* Delete */}
        <button
          onClick={() => onDelete(piece.id)}
          title="Remove"
          className="absolute top-1.5 right-1.5 bg-black/30 hover:bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
        >
          ×
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-snug line-clamp-2">
          {piece.title}
        </p>
        {piece.composer && (
          <p className="text-xs text-gray-500 dark:text-slate-400 italic line-clamp-1">
            {piece.composer}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-auto pt-1">
          {formatDate(piece.masteredDate)}
        </p>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

interface PiecesViewProps {
  pieces: PieceLog[];
  onPiecesChange: (pieces: PieceLog[]) => void;
}

export default function PiecesView({ pieces, onPiecesChange }: PiecesViewProps) {
  const [filterInstrument, setFilterInstrument] = useState<PieceInstrument | "all">("all");

  function handleAdd(piece: PieceLog) {
    onPiecesChange(addPiece(piece));
  }

  function handleDelete(id: string) {
    onPiecesChange(deletePiece(id));
  }

  const filtered = pieces
    .filter((p) => filterInstrument === "all" || p.instrument === filterInstrument)
    .sort((a, b) => b.masteredDate.localeCompare(a.masteredDate));

  // Stats
  const byInstrument = INSTRUMENTS.map((inst) => ({
    inst,
    count: pieces.filter((p) => p.instrument === inst).length,
  })).filter((x) => x.count > 0);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-lg font-bold mb-1">🎵 My Repertoire</p>
        <p className="text-sm opacity-80 leading-relaxed">
          Every piece you can play. {pieces.length > 0 ? `${pieces.length} piece${pieces.length !== 1 ? "s" : ""} and counting.` : "Start building it."}
        </p>
      </div>

      {/* Add form */}
      <AddForm onAdd={handleAdd} />

      {/* Instrument filter */}
      {byInstrument.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterInstrument("all")}
            className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
              filterInstrument === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            All ({pieces.length})
          </button>
          {byInstrument.map(({ inst, count }) => (
            <button
              key={inst}
              onClick={() => setFilterInstrument(inst)}
              className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                filterInstrument === inst
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {INSTRUMENT_META[inst].icon} {INSTRUMENT_META[inst].label} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Summary stats */}
      {pieces.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(["beginner", "intermediate", "advanced"] as PieceDifficulty[]).map((lvl) => {
            const count = pieces.filter((p) => p.difficulty === lvl).length;
            return (
              <div key={lvl} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 p-3 text-center">
                <p className="text-xl font-black text-gray-800 dark:text-slate-100">{count}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {DIFFICULTY_META[lvl].icon} {DIFFICULTY_META[lvl].label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500">
          <p className="text-4xl mb-3">🎵</p>
          <p className="text-sm">
            {pieces.length === 0 ? "No pieces yet. Add your first one!" : "No pieces match this filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((piece) => (
            <PieceCard key={piece.id} piece={piece} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
