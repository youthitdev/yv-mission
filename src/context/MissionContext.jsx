import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const MissionContext = createContext(null);

export function MissionProvider({ children }) {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]); // 참여 가능한 기수 목록
  const [currentProjectId, setCurrentProjectId] = useState(
    () => localStorage.getItem('dm_current_project_id') || null
  );
  const [currentProgress, setCurrentProgress] = useState(null); // active user_mission_progress (+ mission join)
  const [member, setMember] = useState(null); // project_members (status/pass_used_cnt 등)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentProject = projects.find((p) => p.id === currentProjectId) || null;

  // 참여 가능한(공개된) 기수 목록 로드
  const loadProjects = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .order('start_date', { ascending: false });
    if (err) {
      setError(err.message);
      return;
    }
    setProjects(data || []);
    if (!currentProjectId && data?.length) {
      setCurrentProjectId(data[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectProject = (projectId) => {
    setCurrentProjectId(projectId);
    localStorage.setItem('dm_current_project_id', projectId);
  };

  // 현재 기수의 진행 상태(활성 미션 + 참여 정보) 로드
  const loadProgress = useCallback(async () => {
    if (!user || !currentProjectId) {
      setCurrentProgress(null);
      setMember(null);
      return;
    }
    setLoading(true);
    setError(null);

    // 참가자 등록은 관리자가 "참가자 관리" 탭에서 직접 추가해야만 생성됩니다.
    // (로그인/방문만으로는 어떤 기수에도 자동 등록되지 않음)
    const [{ data: progressRows }, { data: memberRow }] = await Promise.all([
      supabase
        .from('user_mission_progress')
        .select('*, mission:missions(*, category:mission_categories(*))')
        .eq('project_id', currentProjectId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false })
        .limit(1),
      supabase
        .from('project_members')
        .select('*')
        .eq('project_id', currentProjectId)
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    setCurrentProgress(progressRows?.[0] || null);
    setMember(memberRow || null);
    setLoading(false);
  }, [user, currentProjectId]);

  useEffect(() => {
    if (user) loadProjects();
  }, [user, loadProjects]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const drawMission = async () => {
    setError(null);
    const { data, error: err } = await supabase.rpc('draw_mission', {
      p_project_id: currentProjectId,
    });
    if (err) {
      setError(err.message);
      throw err;
    }
    await loadProgress();
    return data;
  };

  const drawMissionInCategory = async (categoryCode) => {
    setError(null);
    const { data, error: err } = await supabase.rpc('draw_mission_in_category', {
      p_project_id: currentProjectId,
      p_category_code: categoryCode,
    });
    if (err) {
      setError(err.message);
      throw err;
    }
    await loadProgress();
    return data;
  };

  const usePass = async () => {
    setError(null);
    const { data, error: err } = await supabase.rpc('use_mission_pass', {
      p_project_id: currentProjectId,
    });
    if (err) {
      setError(err.message);
      throw err;
    }
    await loadProgress();
    return data;
  };

  const completeMission = async (progressId) => {
    setError(null);
    const { data, error: err } = await supabase.rpc('complete_mission', {
      p_progress_id: progressId,
    });
    if (err) {
      setError(err.message);
      throw err;
    }
    await loadProgress();
    return data;
  };

  const remainingPass = currentProject && member ? currentProject.pass_cnt - member.pass_used_cnt : 0;
  const memberStatus = member?.status || null; // 'pending' | 'approved' | 'rejected' | null(아직 신청 전)
  const isApproved = memberStatus === 'approved';

  return (
    <MissionContext.Provider
      value={{
        projects,
        currentProject,
        currentProjectId,
        selectProject,
        currentProgress,
        member,
        memberStatus,
        isApproved,
        remainingPass,
        loading,
        error,
        drawMission,
        drawMissionInCategory,
        usePass,
        completeMission,
        reload: loadProgress,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission은 MissionProvider 내부에서만 사용할 수 있습니다.');
  return ctx;
}
