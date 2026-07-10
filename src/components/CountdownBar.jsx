import { useEffect, useState } from 'react';
import { formatRemaining, msUntil } from '../utils/time';

export default function CountdownBar({ expiresAt, nickname }) {
  const [remaining, setRemaining] = useState(() => (expiresAt ? msUntil(expiresAt) : 0));
  const name = nickname || '나';

  useEffect(() => {
    if (!expiresAt) return;
    setRemaining(msUntil(expiresAt));
    const id = setInterval(() => setRemaining(msUntil(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) {
    return (
      <div className="w-full rounded-xl bg-mission-card px-4 py-3 text-center text-sm text-white/70">
        새로운 미션을 뽑을 수 있어요!
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-mission-card px-4 py-3 text-center text-sm">
      <span className="text-white/70">{name}님의 미션 수행 시간이 </span>
      <span className="font-semibold text-mission-accent">{formatRemaining(remaining)}</span>
      <span className="text-white/70"> 남았습니다.</span>
    </div>
  );
}
