import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import FlipCard from '../components/FlipCard';
import MissionFrontArt from '../components/cardArt/MissionFrontArt';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { getCategoryMeta } from '../utils/categories';

const ALL_CATEGORIES = ['alone', 'together', 'move', 'new', 'observe'];

export default function MissionSelectPage() {
  const { user } = useAuth();
  const { currentProjectId } = useMission();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || ALL_CATEGORIES[0];
  const [missions, setMissions] = useState([]);
  const [revealedIds, setRevealedIds] = useState(new Set()); // 내가 뽑아본 적 있는 미션 id들
  const [flippedId, setFlippedId] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentProjectId || !user) return;
    setLoading(true);
    Promise.all([
      supabase
        .from('missions')
        .select('*, category:mission_categories(*)')
        .eq('project_id', currentProjectId)
        .eq('is_active', true),
      supabase
        .from('user_mission_progress')
        .select('mission_id')
        .eq('project_id', currentProjectId)
        .eq('user_id', user.id),
    ]).then(([missionsRes, progressRes]) => {
      setMissions(missionsRes.data || []);
      setRevealedIds(new Set((progressRes.data || []).map((r) => r.mission_id)));
      setLoading(false);
    });
  }, [currentProjectId, user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = missions
    .filter((m) => m.category?.code === activeCategory)
    .sort((a, b) => a.no - b.no);

  const handleCardClick = (mission) => {
    if (!revealedIds.has(mission.id)) {
      setToast('아직 뽑지 않은 미션입니다');
      return;
    }
    setFlippedId((cur) => (cur === mission.id ? null : mission.id));
  };

  return (
    <div className="max-w-md mx-auto pb-10 relative">
      <Header />
      <h2 className="px-4 text-lg font-semibold mb-3">미션선택</h2>

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

      <div className="grid grid-cols-2 gap-3 px-4">
        {loading && <p className="text-white/50 text-sm col-span-2">불러오는 중...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-white/50 text-sm col-span-2">이 카테고리에 등록된 미션이 없습니다.</p>
        )}
        {filtered.map((m) => (
          <FlipCard
            key={m.id}
            flipped={flippedId === m.id}
            onClick={() => handleCardClick(m)}
            front={<MissionFrontArt seed={m.no} />}
            back={
              <div className="w-full h-full rounded-xl bg-mission-card border border-white/10 flex flex-col justify-center px-3 text-left gap-1">
                <span className="text-xs text-white/50">Mission {m.no}</span>
                <span className="font-semibold text-sm leading-snug line-clamp-3">{m.title}</span>
                <span className="text-xs text-white/60 line-clamp-3">{m.description}</span>
              </div>
            }
          />
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-full">
          {toast}
        </div>
      )}
    </div>
  );
}
