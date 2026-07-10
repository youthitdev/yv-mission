import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { useMission } from '../context/MissionContext';
import { getCategoryMeta } from '../utils/categories';

const ALL_CATEGORIES = ['alone', 'together', 'move', 'new', 'observe'];

export default function MissionSelectPage() {
  const { currentProjectId } = useMission();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || ALL_CATEGORIES[0];
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentProjectId) return;
    setLoading(true);
    supabase
      .from('missions')
      .select('*, category:mission_categories(*)')
      .eq('project_id', currentProjectId)
      .eq('is_active', true)
      .then(({ data }) => {
        setMissions(data || []);
        setLoading(false);
      });
  }, [currentProjectId]);

  const filtered = missions
    .filter((m) => m.category?.code === activeCategory)
    .sort((a, b) => a.no - b.no);

  return (
    <div className="max-w-md mx-auto pb-10">
      <Header />
      <h2 className="px-4 text-lg font-semibold mb-3">미션선택</h2>

      <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
        {ALL_CATEGORIES.map((code) => {
          const meta = getCategoryMeta(code);
          const active = code === activeCategory;
          return (
            <button
              key={code}
              onClick={() => setSearchParams({ category: code })}
              className={`shrink-0 px-3 py-2 rounded-full text-sm ${
                active ? 'bg-mission-accent text-black' : 'bg-mission-card text-white/70'
              }`}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 px-4">
        {loading && <p className="text-white/50 text-sm">불러오는 중...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-white/50 text-sm">이 카테고리에 등록된 미션이 없습니다.</p>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="bg-mission-card rounded-xl p-4">
            <p className="text-xs text-white/50 mb-1">Mission {m.no}</p>
            <p className="font-semibold mb-1">{m.title}</p>
            <p className="text-sm text-white/60">{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
