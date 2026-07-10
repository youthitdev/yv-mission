export default function MissionCard({ progress, canDraw, onClick, onDraw, drawing }) {
  if (!progress) {
    return (
      <button
        onClick={onDraw}
        disabled={!canDraw || drawing}
        className="col-span-1 row-span-1 aspect-square rounded-xl bg-mission-card border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 disabled:opacity-40"
      >
        <span className="text-3xl">🎲</span>
        <span className="text-sm font-medium">{drawing ? '뽑는 중...' : '미션 뽑기'}</span>
      </button>
    );
  }

  const mission = progress.mission;

  return (
    <button
      onClick={onClick}
      className="col-span-1 row-span-1 aspect-square rounded-xl bg-mission-dark border border-white/10 flex flex-col justify-center px-4 text-left gap-1"
    >
      <span className="text-xs text-white/50">Now · Mission {mission?.no}</span>
      <span className="font-semibold leading-snug line-clamp-2">{mission?.title}</span>
      <span className="text-xs text-white/60 line-clamp-2">{mission?.description}</span>
    </button>
  );
}
