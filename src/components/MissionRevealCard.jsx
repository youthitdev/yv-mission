import MissionFrontArt from './cardArt/MissionFrontArt';

// 뽑힌/완료된 미션을 "블랙 카드 + 점선 구분선 + 배경 일러스트(저투명도)" 스타일로 보여주는 카드
export default function MissionRevealCard({ mission, label = 'Now', onClick, statusBadge }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-full rounded-xl bg-black border border-white/10 flex flex-col overflow-hidden text-left"
    >
      <div className="absolute inset-0 opacity-25">
        <MissionFrontArt seed={mission?.no ?? 0} />
      </div>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 px-4 pt-4 pb-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white/90">
            {label} - Mission {mission?.no}
          </span>
          {statusBadge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
              {statusBadge}
            </span>
          )}
        </div>
        <div className="border-t border-dashed border-white/30 mb-3" />
        <p className="font-bold text-base leading-snug line-clamp-1">{mission?.title}</p>
        <p className="text-xs text-white/50 line-clamp-2 mt-1">{mission?.description}</p>
      </div>
    </button>
  );
}
