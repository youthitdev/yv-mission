import { useEffect, useRef, useState } from 'react';
import { formatRemaining, msUntil } from '../utils/time';

export default function CountdownBar({ expiresAt, nickname, onExpire }) {
  const [remaining, setRemaining] = useState(() => (expiresAt ? msUntil(expiresAt) : 0));
  const firedRef = useRef(false);
  const name = nickname || '나';

  useEffect(() => {
    firedRef.current = false;
    if (!expiresAt) return;
    setRemaining(msUntil(expiresAt));
    const id = setInterval(() => {
      const ms = msUntil(expiresAt);
      setRemaining(ms);
      if (ms <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

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
