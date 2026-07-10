import MissionRevealCard from './MissionRevealCard';

export default function MissionCard({ progress, onOpenDetail }) {
  if (!progress) {
    return (
      <div className="col-span-1 row-span-1 aspect-square rounded-xl bg-mission-card border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 px-3 text-center">
        <span className="text-sm text-white/60">아래 카테고리를 선택해서{'\n'}미션을 뽑아보세요</span>
      </div>
    );
  }

  return (
    <div className="aspect-square">
      <MissionRevealCard mission={progress.mission} label="Now" onClick={onOpenDetail} />
    </div>
  );
}
