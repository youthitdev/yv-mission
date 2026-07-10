import { getCategoryMeta } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

export default function CategoryTile({ code, highlighted, onClick }) {
  const meta = getCategoryMeta(code);
  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
        highlighted ? 'bg-mission-accent text-black' : 'bg-mission-card text-white/80'
      }`}
    >
      <CategoryIcon code={code} className="w-12 h-12" />
      <span className="text-lg font-bold">{meta.label}</span>
    </button>
  );
}
