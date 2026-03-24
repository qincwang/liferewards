import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, ActivityIndicator } from "react-native";
import { fetchPieceCover } from "../store/pieces";
import type { PieceLog, PieceDifficulty, PieceInstrument } from "../store/pieces";

// ─── Meta ──────────────────────────────────────────────────────────────────────

const INSTRUMENT_META: Record<PieceInstrument, { label: string; icon: string; selectedRing: string; badgeBg: string; badgeText: string }> = {
  electric_guitar:  { label: "Electric",  icon: "🎸", selectedRing: "border-purple-500 bg-purple-50", badgeBg: "bg-purple-100", badgeText: "text-purple-700" },
  classical_guitar: { label: "Classical", icon: "🎼", selectedRing: "border-amber-500  bg-amber-50",  badgeBg: "bg-amber-100",  badgeText: "text-amber-700"  },
  drums:            { label: "Drums",     icon: "🥁", selectedRing: "border-red-500    bg-red-50",    badgeBg: "bg-red-100",    badgeText: "text-red-700"    },
  piano:            { label: "Piano",     icon: "🎹", selectedRing: "border-blue-500   bg-blue-50",   badgeBg: "bg-blue-100",   badgeText: "text-blue-700"   },
  other:            { label: "Other",     icon: "🎵", selectedRing: "border-gray-400   bg-gray-50",   badgeBg: "bg-gray-100",   badgeText: "text-gray-600"   },
};

const DIFFICULTY_META: Record<PieceDifficulty, { label: string; icon: string; sublabel: string; selectedRing: string }> = {
  beginner:     { label: "Beginner",     icon: "🌱", sublabel: "Entry level", selectedRing: "border-emerald-500 bg-emerald-50" },
  intermediate: { label: "Intermediate", icon: "🔥", sublabel: "Takes work",  selectedRing: "border-amber-500   bg-amber-50"   },
  advanced:     { label: "Advanced",     icon: "💀", sublabel: "Demanding",   selectedRing: "border-red-500     bg-red-50"     },
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

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);

    const coverUrl = await fetchPieceCover(instrument);

    onAdd({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
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
    <View className="bg-white rounded-2xl border border-gray-100 p-5 gap-y-4 shadow-sm">
      <Text className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        🎵 Add a Piece
      </Text>

      {/* Title */}
      <View>
        <Text className="text-xs font-medium text-gray-500 mb-1">Piece Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Asturias (Leyenda)"
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Composer + Date */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-xs font-medium text-gray-500 mb-1">
            Composer <Text className="font-normal text-gray-400">(optional)</Text>
          </Text>
          <TextInput
            value={composer}
            onChangeText={setComposer}
            placeholder="e.g. Isaac Albéniz"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-medium text-gray-500 mb-1">Mastered Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Instrument picker */}
      <View>
        <Text className="text-xs font-medium text-gray-500 mb-2">Instrument</Text>
        <View className="flex-row gap-1.5">
          {INSTRUMENTS.map((inst) => {
            const m = INSTRUMENT_META[inst];
            const active = instrument === inst;
            return (
              <TouchableOpacity
                key={inst}
                onPress={() => setInstrument(inst)}
                className={`flex-1 items-center gap-1 py-2 rounded-xl border-2 ${
                  active ? m.selectedRing : "border-gray-200 bg-gray-50"
                }`}
              >
                <Text className="text-lg">{m.icon}</Text>
                <Text style={{ fontSize: 10 }} className={`font-semibold text-center leading-tight ${active ? "" : "text-gray-600"}`}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Difficulty picker */}
      <View>
        <Text className="text-xs font-medium text-gray-500 mb-2">Difficulty</Text>
        <View className="flex-row gap-2">
          {DIFFICULTIES.map((lvl) => {
            const m = DIFFICULTY_META[lvl];
            const active = difficulty === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setDifficulty(lvl)}
                className={`flex-1 items-center gap-1 py-2.5 rounded-xl border-2 ${
                  active ? m.selectedRing : "border-gray-200 bg-gray-50"
                }`}
              >
                <Text className="text-xl">{m.icon}</Text>
                <Text className={`text-xs font-semibold ${active ? "" : "text-gray-600"}`}>{m.label}</Text>
                <Text style={{ fontSize: 10 }} className="text-gray-400">{m.sublabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !title.trim()}
        className={`w-full py-2.5 rounded-xl items-center flex-row justify-center gap-2 ${
          loading || !title.trim() ? "bg-indigo-300" : "bg-indigo-600"
        }`}
      >
        {loading
          ? <><ActivityIndicator size="small" color="#fff" /><Text className="text-white text-sm font-semibold"> Fetching cover…</Text></>
          : <Text className="text-white text-sm font-semibold">Add to Repertoire</Text>
        }
      </TouchableOpacity>
    </View>
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
  const [imgError, setImgError] = useState(false);

  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ width: "31%" }}>
      {/* Cover / icon area */}
      <View
        className={`items-center justify-center relative ${piece.coverUrl && !imgError ? "" : inst.badgeBg}`}
        style={{ aspectRatio: 2/3 }}
      >
        {piece.coverUrl && !imgError ? (
          <Image
            source={{ uri: piece.coverUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Text className="text-5xl">{inst.icon}</Text>
        )}
        {/* Instrument + difficulty badges */}
        <View className="absolute bottom-2 left-2 bg-black/30 rounded-full px-1.5 py-0.5">
          <Text style={{ fontSize: 12 }}>{inst.icon}{diff.icon}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(piece.id)}
          className="absolute top-1.5 right-1.5 bg-black/30 rounded-full w-6 h-6 items-center justify-center"
        >
          <Text className="text-white text-xs font-bold">×</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View className="p-3 gap-y-1">
        <Text className="text-sm font-semibold text-gray-800 leading-snug" numberOfLines={2}>
          {piece.title}
        </Text>
        {piece.composer && (
          <Text className="text-xs text-gray-500 italic" numberOfLines={1}>
            {piece.composer}
          </Text>
        )}
        <Text className="text-xs text-gray-400 mt-auto pt-1">
          {formatDate(piece.masteredDate)}
        </Text>
      </View>
    </View>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

interface PiecesViewProps {
  pieces: PieceLog[];
  onAdd: (piece: PieceLog) => void;
  onDelete: (id: string) => void;
}

export default function PiecesView({ pieces, onAdd, onDelete }: PiecesViewProps) {
  const [filterInstrument, setFilterInstrument] = useState<PieceInstrument | "all">("all");

  const filtered = pieces
    .filter((p) => filterInstrument === "all" || p.instrument === filterInstrument)
    .sort((a, b) => b.masteredDate.localeCompare(a.masteredDate));

  const byInstrument = INSTRUMENTS.map((inst) => ({
    inst,
    count: pieces.filter((p) => p.instrument === inst).length,
  })).filter((x) => x.count > 0);

  return (
    <View className="gap-y-5">
      {/* Hero */}
      <View className="bg-violet-600 rounded-2xl p-5 shadow-lg">
        <Text className="text-lg font-bold text-white mb-1">🎵 My Repertoire</Text>
        <Text className="text-sm text-white/80 leading-relaxed">
          Every piece you can play. {pieces.length > 0 ? `${pieces.length} piece${pieces.length !== 1 ? "s" : ""} and counting.` : "Start building it."}
        </Text>
      </View>

      {/* Add form */}
      <AddForm onAdd={onAdd} />

      {/* Instrument filter */}
      {byInstrument.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setFilterInstrument("all")}
              className={`px-3 py-1 rounded-full ${filterInstrument === "all" ? "bg-indigo-600" : "bg-gray-100"}`}
            >
              <Text className={`text-sm font-medium ${filterInstrument === "all" ? "text-white" : "text-gray-600"}`}>
                All ({pieces.length})
              </Text>
            </TouchableOpacity>
            {byInstrument.map(({ inst, count }) => (
              <TouchableOpacity
                key={inst}
                onPress={() => setFilterInstrument(inst)}
                className={`px-3 py-1 rounded-full ${filterInstrument === inst ? "bg-indigo-600" : "bg-gray-100"}`}
              >
                <Text className={`text-sm font-medium ${filterInstrument === inst ? "text-white" : "text-gray-600"}`}>
                  {INSTRUMENT_META[inst].icon} {INSTRUMENT_META[inst].label} ({count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Summary stats */}
      {pieces.length > 0 && (
        <View className="flex-row gap-3">
          {(["beginner", "intermediate", "advanced"] as PieceDifficulty[]).map((lvl) => {
            const count = pieces.filter((p) => p.difficulty === lvl).length;
            return (
              <View key={lvl} className="bg-white rounded-xl border border-gray-100 p-3 items-center flex-1">
                <Text className="text-xl font-black text-gray-800">{count}</Text>
                <Text className="text-xs text-gray-400 mt-0.5 text-center">
                  {DIFFICULTY_META[lvl].icon} {DIFFICULTY_META[lvl].label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <View className="items-center py-16">
          <Text className="text-4xl mb-3">🎵</Text>
          <Text className="text-sm text-gray-400">
            {pieces.length === 0 ? "No pieces yet. Add your first one!" : "No pieces match this filter."}
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {filtered.map((piece) => (
            <PieceCard key={piece.id} piece={piece} onDelete={onDelete} />
          ))}
        </View>
      )}
    </View>
  );
}
