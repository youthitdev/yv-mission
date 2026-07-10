import { useState } from 'react';
import FlipCard from './FlipCard';
import MissionFrontArt from './cardArt/MissionFrontArt';

export default function MissionCard({ progress, onOpenDetail }) {
  const [flipped, setFlipped] = useState(false);

  if (!progress) {
    return (
      <div className="col-span-1 row-span-1 aspect-square rounded-xl bg-mission-card border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 px-3 text-center">
        <span className="text-sm text-white/60">아래 카테고리를 선택해서{'\n'}미션을 뽑아보세요</span>
      </div>
    );
  }

  const mission = progress.mission;

  return (
    <FlipCard
      flipped={flipped}
      onClick={() => setFlipped((f) => !f)}
      front={<MissionFrontArt seed={mission?.no ?? 0} />}
      back={
        <div className="w-full h-full rounded-xl bg-mission-dark border border-white/10 flex flex-col justify-center px-4 text-left gap-1">
          <span className="text-xs text-white/50">Now · Mission {mission?.no}</span>
          <span className="font-semibold leading-snug line-clamp-2">{mission?.title}</span>
          <span className="text-xs text-white/60 line-clamp-2">{mission?.description}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
            className="mt-1 text-xs text-mission-accent underline self-start"
          >
            자세히 보기
          </button>
        </div>
      }
    />
  );
}
