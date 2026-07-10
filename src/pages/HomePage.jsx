import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CountdownBar from '../components/CountdownBar';
import MissionGrid from '../components/MissionGrid';
import MissionDetailModal from '../components/MissionDetailModal';
import InfoDialog from '../components/InfoDialog';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { formatRemaining, msUntil } from '../utils/time';

const STATUS_MESSAGE = {
  pending: '관리자 승인 후 미션을 시작할 수 있어요. 승인될 때까지 잠시만 기다려주세요.',
  rejected: '이번 기수 참여가 승인되지 않았습니다. 담당자에게 문의해주세요.',
};

export default function HomePage() {
  const {
    currentProject,
    currentProgress,
    remainingPass,
    usePass,
    completeMission,
    error,
    reload,
    memberStatus,
    isApproved,
  } = useMission();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');

  const hasActiveMission = !!currentProgress && msUntil(currentProgress.expires_at) > 0;

  const handleCategoryClick = (code) => {
    if (!isApproved) return;
    if (hasActiveMission) {
      const remaining = formatRemaining(msUntil(currentProgress.expires_at));
      setLockedMessage(`다음 미션을 선택하려면 ${remaining} 남았습니다.`);
      return;
    }
    navigate(`/missions?category=${code}&mode=draw`);
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <Header />

      {!currentProject ? (
        <p className="text-center text-white/60 mt-10 px-6">참여 가능한 기수가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="px-4">
            <CountdownBar expiresAt={currentProgress?.expires_at} nickname={profile?.nickname} onExpire={reload} />
          </div>

          {!isApproved && memberStatus && (
            <div className="mx-4 rounded-xl border border-mission-accent/50 bg-mission-card px-4 py-4 text-center text-sm text-white/80">
              {STATUS_MESSAGE[memberStatus] || '관리자 승인이 필요합니다.'}
            </div>
          )}

          <div className={!isApproved ? 'opacity-40 pointer-events-none select-none' : ''}>
            <MissionGrid
              progress={currentProgress}
              onOpenMission={() => setModalOpen(true)}
              onCategoryClick={handleCategoryClick}
            />
          </div>

          {error && <p className="text-center text-red-400 text-sm px-4">{error}</p>}
        </div>
      )}

      {modalOpen && currentProgress && (
        <MissionDetailModal
          progress={currentProgress}
          remainingPass={remainingPass}
          onClose={() => setModalOpen(false)}
          onUsePass={usePass}
          onComplete={completeMission}
        />
      )}

      {lockedMessage && <InfoDialog message={lockedMessage} onClose={() => setLockedMessage('')} />}
    </div>
  );
}
