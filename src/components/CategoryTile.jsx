import { getCategoryMeta } from '../utils/categories';

export default function CategoryTile({ code, highlighted, onClick }) {
  const meta = getCategoryMeta(code);
  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${
        highlighted ? 'bg-mission-accent text-black' : 'bg-mission-card text-white/80'
      }`}
    >
      <span className="text-2xl">{meta.emoji}</span>
      <span className="text-sm font-medium">{meta.label}</span>
    </button>
  );
}
