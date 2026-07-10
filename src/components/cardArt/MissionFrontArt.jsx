import { PATTERNS } from './patterns';
import { COLOR_PAIRS } from './palette';

// 패턴 x 색상조합의 전체 경우의 수 (겹치지 않는 조합 개수)
const TOTAL_COMBOS = PATTERNS.length * COLOR_PAIRS.length;

// 0~TOTAL_COMBOS-1 을 고정 시드로 한 번 섞어서, 미션 번호(no)를 이 배열의
// 인덱스로 사용 -> 미션이 50개(<= 조합 수)인 한 서로 다른 미션은 항상
// 서로 다른 패턴/색상 조합을 갖게 되어 "같은 이미지"가 나오지 않음.
function seededShuffle(length, seed) {
  const arr = Array.from({ length }, (_, i) => i);
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const COMBO_ORDER = seededShuffle(TOTAL_COMBOS, 42);

export default function MissionFrontArt({ seed = 0, className = '' }) {
  const comboIndex = COMBO_ORDER[((seed % TOTAL_COMBOS) + TOTAL_COMBOS) % TOTAL_COMBOS];
  const patternIndex = comboIndex % PATTERNS.length;
  const colorIndex = Math.floor(comboIndex / PATTERNS.length) % COLOR_PAIRS.length;
  const Pattern = PATTERNS[patternIndex];
  const [bg, fg] = COLOR_PAIRS[colorIndex];
  return (
    <div className={`w-full h-full overflow-hidden ${className}`}>
      <Pattern bg={bg} fg={fg} />
    </div>
  );
}
