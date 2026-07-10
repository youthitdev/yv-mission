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
      <div className="w-full rounded-xl bg-mission-card px-4 py-5 text-center">
        <p className="text-lg font-semibold text-white/80">새로운 미션을 뽑을 수 있어요!</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-mission-card px-4 py-5 text-center">
      <p className="text-xl font-bold mb-1">{name}님</p>
      <p className="text-lg leading-snug">
        <span className="text-white/80">미션 수행 시간이 </span>
        <span className="font-bold text-mission-accent">{formatRemaining(remaining)}</span>
        <span className="text-white/80"> 남았습니다.</span>
      </p>
    </div>
  );
}
