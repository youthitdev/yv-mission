import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { getCategoryMeta } from '../utils/categories';

const STATUS_LABEL = {
  active: '진행 중',
  completed: '완료',
  passed: '패스함',
  expired: '기간만료',
};

export default function MissionCheckPage() {
  const { user } = useAuth();
  const { currentProjectId } = useMission();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !currentProjectId) return;
    setLoading(true);
    supabase
      .from('user_mission_progress')
      .select('*, mission:missions(*, category:mission_categories(*))')
      .eq('project_id', currentProjectId)
      .eq('user_id', user.id)
      .order('assigned_at', { ascending: false })
      .then(({ data }) => {
        setRows(data || []);
        setLoading(false);
      });
  }, [user, currentProjectId]);

  return (
    <div className="max-w-md mx-auto pb-10">
      <Header />
      <h2 className="px-4 text-lg font-semibold mb-3">미션확인</h2>

      <div className="flex flex-col gap-2 px-4">
        {loading && <p className="text-white/50 text-sm">불러오는 중...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-white/50 text-sm">아직 뽑은 미션이 없습니다.</p>
        )}
        {rows.map((row) => {
          const meta = getCategoryMeta(row.mission?.category?.code);
          return (
            <div key={row.id} className="bg-mission-card rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  {meta.emoji} {meta.label} · Mission {row.mission?.no}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-mission-dark">
                  {STATUS_LABEL[row.status] || row.status}
                </span>
              </div>
              <p className="font-semibold">{row.mission?.title}</p>
              <p className="text-sm text-white/60">{row.mission?.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
