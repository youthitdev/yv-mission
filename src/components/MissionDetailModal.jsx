import { useState } from 'react';
import { getCategoryMeta } from '../utils/categories';

export default function MissionDetailModal({
  progress,
  remainingPass,
  onClose,
  onUsePass,
  onComplete,
}) {
  const [busy, setBusy] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);

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
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-mission-card rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded-full bg-mission-dark text-white/70">
            {categoryMeta.emoji} {categoryMeta.label}
          </span>
          <button onClick={onClose} className="text-white/50 text-xl leading-none">
            ✕
          </button>
        </div>

        <div>
          <p className="text-xs text-white/50 mb-1">Mission {mission?.no}</p>
          <h2 className="text-xl font-bold mb-2">{mission?.title}</h2>
          <p className="text-white/70 text-sm leading-relaxed">{mission?.description}</p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
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
              className="w-full py-3 rounded-xl bg-mission-dark border border-white/10 disabled:opacity-40"
            >
              미션패스 ({remainingPass}회 남음)
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handlePass}
                disabled={busy}
                className="flex-1 py-3 rounded-xl bg-red-500/80 font-semibold"
              >
                패스 확정
              </button>
              <button
                onClick={() => setConfirmPass(false)}
                className="flex-1 py-3 rounded-xl bg-mission-dark border border-white/10"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
