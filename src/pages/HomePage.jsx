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

export default function HomePage() {
  const { currentProject, currentProgress, remainingPass, usePass, completeMission, error, reload } = useMission();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');

  const hasActiveMission = !!currentProgress && msUntil(currentProgress.expires_at) > 0;

  const handleCategoryClick = (code) => {
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

          <MissionGrid
            progress={currentProgress}
            onOpenMission={() => setModalOpen(true)}
            onCategoryClick={handleCategoryClick}
          />

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
