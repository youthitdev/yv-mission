import { useState } from 'react';
import Header from '../components/Header';
import CountdownBar from '../components/CountdownBar';
import MissionGrid from '../components/MissionGrid';
import MissionDetailModal from '../components/MissionDetailModal';
import { useMission } from '../context/MissionContext';

export default function HomePage() {
  const { currentProject, currentProgress, remainingPass, drawMission, usePass, completeMission, error } =
    useMission();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const canDraw = !!currentProject && !currentProject.is_closed;

  const handleDraw = async () => {
    setDrawing(true);
    try {
      await drawMission();
    } catch (e) {
      alert(e.message || '미션 뽑기에 실패했습니다.');
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <Header />

      {!currentProject ? (
        <p className="text-center text-white/60 mt-10 px-6">참여 가능한 기수가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="px-4">
            <CountdownBar expiresAt={currentProgress?.expires_at} />
          </div>

          <MissionGrid
            progress={currentProgress}
            canDraw={canDraw}
            drawing={drawing}
            onDraw={handleDraw}
            onOpenMission={() => setModalOpen(true)}
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
    </div>
  );
}
