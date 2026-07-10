import { useEffect, useState } from 'react';
import { getCategoryMeta } from '../utils/categories';
import { formatRemaining, msUntil } from '../utils/time';

export default function MissionDetailModal({
  progress,
  remainingPass,
  onClose,
  onUsePass,
  onComplete,
}) {
  const [busy, setBusy] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const [remaining, setRemaining] = useState(() => msUntil(progress?.expires_at));

  useEffect(() => {
    if (!progress?.expires_at) return;
    setRemaining(msUntil(progress.expires_at));
    const id = setInterval(() => setRemaining(msUntil(progress.expires_at)), 1000);
    return () => clearInterval(id);
  }, [progress?.expires_at]);

  if (!progress) return null;
  const mission = progress.mission;
  const categoryMeta = getCategoryMeta(mission?.category?.code);

  const handlePass = async () => {
    setBusy(true);
    try {
      await onUsePass();
      onClose();
    } catch (e) {
      alert(e.message || '미션패스 사용에 실패했습니다.');
    } finally {
      setBusy(false);
      setConfirmPass(false);
    }
  };

  const handleComplete = async () => {
    setBusy(true);
    try {
      await onComplete(progress.id);
      onClose();
    } catch (e) {
      alert(e.message || '완료 처리에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center px-0 sm:px-6">
      <div className="w-full sm:max-w-sm bg-mission-card rounded-t-2xl sm:rounded-2xl p-6 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-2xl font-bold">Mission {String(mission?.no).padStart(2, '0')}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">
              {categoryMeta.emoji} {categoryMeta.label}
            </span>
            <button onClick={onClose} className="text-white/50 text-lg leading-none">
              ✕
            </button>
          </div>
        </div>

        <div className="border-t border-dashed border-white/25 mb-4" />

        <h3 className="text-xl font-bold mb-2">{mission?.title}</h3>
        <p className="text-white/70 text-sm leading-relaxed mb-6">{mission?.description}</p>

        <div className="flex flex-col items-center gap-3 mt-auto">
          <button
            onClick={handleComplete}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-mission-accent text-black font-semibold disabled:opacity-50"
          >
            미션 완료하기
          </button>

          {!confirmPass ? (
            <button
              onClick={() => setConfirmPass(true)}
              disabled={busy || remainingPass <= 0}
              className="px-6 py-2 rounded-full bg-white/10 text-sm disabled:opacity-40"
            >
              미션패스({remainingPass}회)
            </button>
          ) : (
            <div className="flex gap-2 w-full">
              <button
                onClick={handlePass}
                disabled={busy}
                className="flex-1 py-2 rounded-full bg-red-500/80 text-sm font-semibold"
              >
                패스 확정
              </button>
              <button
                onClick={() => setConfirmPass(false)}
                className="flex-1 py-2 rounded-full bg-white/10 text-sm"
              >
                취소
              </button>
            </div>
          )}

          {progress?.expires_at && (
            <p className="text-xs text-white/40 mt-1">미션 수행: {formatRemaining(remaining)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
