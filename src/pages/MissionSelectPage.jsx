import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import FlipCard from '../components/FlipCard';
import MissionFrontArt from '../components/cardArt/MissionFrontArt';
import MissionDetailModal from '../components/MissionDetailModal';
import MissionRevealCard from '../components/MissionRevealCard';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { getCategoryMeta } from '../utils/categories';

const ALL_CATEGORIES = ['alone', 'together', 'move', 'new', 'observe'];
const STATUS_LABEL = {
  active: '진행 중',
  completed: '완료',
  passed: '패스함',
  expired: '기간만료',
};

export default function MissionSelectPage() {
  const { user } = useAuth();
  const {
    currentProjectId,
    currentProject,
    drawMissionInCategory,
    remainingPass,
    usePass,
    completeMission,
    reload,
  } = useMission();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || ALL_CATEGORIES[0];
  const drawMode = searchParams.get('mode') === 'draw';

  const [missions, setMissions] = useState([]);
  const [progressByMissionId, setProgressByMissionId] = useState({}); // mission_id -> progress row
  const [flippedId, setFlippedId] = useState(null);
  const [modalProgress, setModalProgress] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const loadData = () => {
    if (!currentProjectId || !user) return;
    setLoading(true);
    return Promise.all([
      supabase
        .from('missions')
        .select('*, category:mission_categories(*)')
        .eq('project_id', currentProjectId)
        .eq('is_active', true),
      supabase
        .from('user_mission_progress')
        .select('*, mission:missions(*, category:mission_categories(*))')
        .eq('project_id', currentProjectId)
        .eq('user_id', user.id),
    ]).then(([missionsRes, progressRes]) => {
      setMissions(missionsRes.data || []);
      const map = {};
      (progressRes.data || []).forEach((row) => {
        map[row.mission_id] = row;
      });
      setProgressByMissionId(map);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId, user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = missions
    .filter((m) => m.category?.code === activeCategory)
    .sort((a, b) => a.no - b.no);

  const handleDrawClick = async () => {
    if (drawing) return;
    setDrawing(true);
    try {
      await drawMissionInCategory(activeCategory);
      navigate('/');
    } catch (e) {
      setToast(e.message || '뽑기에 실패했습니다.');
      setDrawing(false);
    }
  };

  const handleBrowseClick = (mission) => {
    if (!progressByMissionId[mission.id]) {
      setToast('아직 뽑지 않은 미션입니다');
      return;
    }
    setFlippedId((cur) => (cur === mission.id ? null : mission.id));
  };

  const handleModalClose = () => {
    setModalProgress(null);
    loadData();
    reload();
  };

  const categoryMeta = getCategoryMeta(activeCategory);

  return (
    <div className="max-w-md mx-auto pb-10 relative">
      <Header />
      <h2 className="px-4 text-lg font-semibold mb-3">미션선택</h2>

      {drawMode ? (
        <div className="mx-4 mb-4 rounded-xl border border-mission-accent/60 text-center px-4 py-3 text-sm text-mission-accent">
          '{categoryMeta.label}' 카테고리의 미션카드를 선택해주세요. 단, 미션패스는{' '}
          {currentProject?.pass_cnt ?? 1}번뿐!
        </div>
      ) : (
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
          {ALL_CATEGORIES.map((code) => {
            const meta = getCategoryMeta(code);
            const active = code === activeCategory;
            return (
              <button
                key={code}
                onClick={() => {
                  setFlippedId(null);
                  setSearchParams({ category: code });
                }}
                className={`shrink-0 px-3 py-2 rounded-full text-sm ${
                  active ? 'bg-mission-accent text-black' : 'bg-mission-card text-white/70'
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 px-4">
        {loading && <p className="text-white/50 text-sm col-span-2">불러오는 중...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-white/50 text-sm col-span-2">이 카테고리에 등록된 미션이 없습니다.</p>
        )}
        {filtered.map((m) => {
          if (drawMode) {
            return (
              <button
                key={m.id}
                onClick={handleDrawClick}
                disabled={drawing}
                className="aspect-square rounded-xl overflow-hidden disabled:opacity-50"
              >
                <MissionFrontArt seed={m.no} />
              </button>
            );
          }

          const progress = progressByMissionId[m.id];

          return (
            <FlipCard
              key={m.id}
              flipped={flippedId === m.id}
              onClick={() => handleBrowseClick(m)}
              front={<MissionFrontArt seed={m.no} />}
              back={
                <MissionRevealCard
                  mission={m}
                  label="Mission"
                  statusBadge={progress ? STATUS_LABEL[progress.status] || progress.status : null}
                  onClick={(e) => {
                    if (progress?.status === 'active') {
                      e.stopPropagation();
                      setModalProgress(progress);
                    }
                  }}
                />
              }
            />
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-full">
          {toast}
        </div>
      )}

      {modalProgress && (
        <MissionDetailModal
          progress={modalProgress}
          remainingPass={remainingPass}
          onClose={handleModalClose}
          onUsePass={usePass}
          onComplete={completeMission}
        />
      )}
    </div>
  );
}
