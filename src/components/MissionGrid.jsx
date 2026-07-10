import MissionCard from './MissionCard';
import CategoryTile from './CategoryTile';

const ALL_CATEGORIES = ['alone', 'together', 'move', 'new', 'observe'];

export default function MissionGrid({ progress, onOpenMission, onCategoryClick }) {
  const activeCategoryCode = progress?.mission?.category?.code;

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      <MissionCard progress={progress} onOpenDetail={onOpenMission} />
      {ALL_CATEGORIES.map((code) => (
        <CategoryTile
          key={code}
          code={code}
          highlighted={code === activeCategoryCode}
          onClick={() => onCategoryClick(code)}
        />
      ))}
    </div>
  );
}
