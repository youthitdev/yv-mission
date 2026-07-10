import { PATTERNS } from './patterns';
import { COLOR_PAIRS } from './palette';

// 미션 번호(no)를 시드로 패턴/색상 조합을 "랜덤하지만 항상 같은 결과"로 고정 배정.
// -> 같은 미션은 새로고침해도 항상 같은 앞면 디자인을 보여줌.
function seededIndex(seed, mod) {
  const hash = Math.abs(Math.sin(seed * 9973.7) * 10000);
  return Math.floor(hash) % mod;
}

export default function MissionFrontArt({ seed = 0, className = '' }) {
  const Pattern = PATTERNS[seededIndex(seed, PATTERNS.length)];
  const [bg, fg] = COLOR_PAIRS[seededIndex(seed + 1, COLOR_PAIRS.length)];
  return (
    <div className={`w-full h-full overflow-hidden ${className}`}>
      <Pattern bg={bg} fg={fg} />
    </div>
  );
}
