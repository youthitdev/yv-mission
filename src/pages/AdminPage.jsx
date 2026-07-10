import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { getCategoryMeta } from '../utils/categories';

const EMPTY_PROJECT = {
  name: '',
  start_date: '',
  end_date: '',
  max_mission: 5,
  interval_seconds: 345600,
  pass_cnt: 1,
  use_category: true,
  is_public: true,
  is_closed: false,
};

export default function AdminPage() {
  const [tab, setTab] = useState('projects'); // 'projects' | 'missions'
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('start_date', { ascending: false });
    setProjects(data || []);
    if (!selectedProjectId && data?.length) setSelectedProjectId(data[0].id);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('mission_categories').select('*').order('sort_order');
    setCategories(data || []);
  };

  useEffect(() => {
    loadProjects();
    loadCategories();
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <Header />
      <h2 className="px-4 text-lg font-semibold mb-3">ADMIN</h2>

      <div className="flex gap-2 px-4 mb-4">
        <button
          onClick={() => setTab('projects')}
          className={`px-3 py-2 rounded-full text-sm ${tab === 'projects' ? 'bg-mission-accent text-black' : 'bg-mission-card text-white/70'}`}
        >
          기수 관리
        </button>
        <button
          onClick={() => setTab('missions')}
          className={`px-3 py-2 rounded-full text-sm ${tab === 'missions' ? 'bg-mission-accent text-black' : 'bg-mission-card text-white/70'}`}
        >
          미션 관리
        </button>
      </div>

      {tab === 'projects' && (
        <div className="flex flex-col gap-6">
          <ProjectAdmin
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={setSelectedProjectId}
            onChanged={loadProjects}
          />
          {selectedProject && (
            <div className="border-t border-white/10 pt-4">
              <h3 className="px-4 text-sm font-semibold text-white/70 mb-3">
                {selectedProject.name} · 참여자 기록
              </h3>
              <ParticipantsAdmin project={selectedProject} />
            </div>
          )}
        </div>
      )}

      {tab === 'missions' && selectedProject && (
        <MissionAdmin project={selectedProject} categories={categories} />
      )}
      {tab === 'missions' && !selectedProject && (
        <p className="px-4 text-white/50 text-sm">먼저 기수를 생성/선택하세요.</p>
      )}
    </div>
  );
}

function ProjectAdmin({ projects, selectedProjectId, onSelect, onChanged }) {
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      start_date: p.start_date,
      end_date: p.end_date,
      max_mission: p.max_mission,
      interval_seconds: p.interval_seconds,
      pass_cnt: p.pass_cnt,
      use_category: p.use_category,
      is_public: p.is_public,
      is_closed: p.is_closed,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_PROJECT);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      max_mission: Number(form.max_mission),
      interval_seconds: Number(form.interval_seconds),
      pass_cnt: Number(form.pass_cnt),
    };
    const query = editingId
      ? supabase.from('projects').update(payload).eq('id', editingId)
      : supabase.from('projects').insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    resetForm();
    onChanged();
  };

  return (
    <div className="px-4 flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="bg-mission-card rounded-xl p-4 flex flex-col gap-3">
        <p className="font-semibold">{editingId ? '기수 수정' : '새 기수 만들기'}</p>
        <input
          placeholder="기수 이름 (예: 2026 TMI PROJECT 3기)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-mission-dark rounded-lg px-3 py-2 border border-white/10"
          required
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="flex-1 bg-mission-dark rounded-lg px-3 py-2 border border-white/10"
            required
          />
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className="flex-1 bg-mission-dark rounded-lg px-3 py-2 border border-white/10"
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs text-white/50">
            Max Mission
            <input
              type="number"
              min={1}
              value={form.max_mission}
              onChange={(e) => setForm({ ...form, max_mission: e.target.value })}
              className="w-full mt-1 bg-mission-dark rounded-lg px-2 py-2 border border-white/10"
            />
          </label>
          <label className="text-xs text-white/50">
            Interval(초)
            <input
              type="number"
              min={1}
              value={form.interval_seconds}
              onChange={(e) => setForm({ ...form, interval_seconds: e.target.value })}
              className="w-full mt-1 bg-mission-dark rounded-lg px-2 py-2 border border-white/10"
            />
          </label>
          <label className="text-xs text-white/50">
            Pass Cnt
            <input
              type="number"
              min={0}
              value={form.pass_cnt}
              onChange={(e) => setForm({ ...form, pass_cnt: e.target.value })}
              className="w-full mt-1 bg-mission-dark rounded-lg px-2 py-2 border border-white/10"
            />
          </label>
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.use_category}
              onChange={(e) => setForm({ ...form, use_category: e.target.checked })}
            />
            카테고리 사용
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
            />
            공개
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_closed}
              onChange={(e) => setForm({ ...form, is_closed: e.target.checked })}
            />
            마감
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-mission-accent text-black font-semibold">
            {editingId ? '수정 저장' : '생성'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="flex-1 py-2 rounded-lg bg-mission-dark border border-white/10">
              취소
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`rounded-xl p-4 cursor-pointer border ${
              p.id === selectedProjectId ? 'border-mission-accent' : 'border-white/10'
            } bg-mission-card`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{p.name}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(p);
                }}
                className="text-xs text-white/50 underline"
              >
                수정
              </button>
            </div>
            <p className="text-xs text-white/50 mt-1">
              {p.start_date} ~ {p.end_date} · Max {p.max_mission} · Interval {p.interval_seconds}s · Pass {p.pass_cnt}
              {p.is_closed ? ' · 마감됨' : ''}
              {!p.is_public ? ' · 비공개' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MissionAdmin({ project, categories }) {
  const [missions, setMissions] = useState([]);
  const [form, setForm] = useState({ no: '', category_id: categories[0]?.id || '', title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*, category:mission_categories(*)')
      .eq('project_id', project.id)
      .order('no');
    setMissions(data || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ no: '', category_id: categories[0]?.id || '', title: '', description: '' });
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setForm({ no: m.no, category_id: m.category_id || '', title: m.title, description: m.description });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      project_id: project.id,
      no: Number(form.no),
      category_id: form.category_id || null,
      title: form.title,
      description: form.description,
    };
    const query = editingId
      ? supabase.from('missions').update(payload).eq('id', editingId)
      : supabase.from('missions').insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    resetForm();
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('이 미션을 삭제할까요?')) return;
    await supabase.from('missions').delete().eq('id', id);
    load();
  };

  return (
    <div className="px-4 flex flex-col gap-6">
      <p className="text-sm text-white/50">
        {project.name} · 등록된 미션 {missions.length} / 50
      </p>

      <form onSubmit={handleSubmit} className="bg-mission-card rounded-xl p-4 flex flex-col gap-3">
        <p className="font-semibold">{editingId ? '미션 수정' : '미션 추가'}</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="번호 (1~50)"
            value={form.no}
            onChange={(e) => setForm({ ...form, no: e.target.value })}
            className="w-28 bg-mission-dark rounded-lg px-3 py-2 border border-white/10"
            required
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="flex-1 bg-mission-dark rounded-lg px-3 py-2 border border-white/10"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getCategoryMeta(c.code).emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
        <input
          placeholder="미션 제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-mission-dark rounded-lg px-3 py-2 border border-white/10"
          required
        />
        <textarea
          placeholder="미션 설명"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-mission-dark rounded-lg px-3 py-2 border border-white/10 min-h-24"
          required
        />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-mission-accent text-black font-semibold">
            {editingId ? '수정 저장' : '추가'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="flex-1 py-2 rounded-lg bg-mission-dark border border-white/10">
              취소
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {missions.map((m) => (
          <div key={m.id} className="bg-mission-card rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-white/50">
                Mission {m.no} · {getCategoryMeta(m.category?.code).label}
              </p>
              <p className="font-semibold">{m.title}</p>
              <p className="text-sm text-white/60">{m.description}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => startEdit(m)} className="text-xs text-white/50 underline">
                수정
              </button>
              <button onClick={() => handleDelete(m.id)} className="text-xs text-red-400 underline">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_LABEL = {
  active: '진행 중',
  completed: '완료',
  passed: '패스함',
  expired: '기간만료',
};

function ParticipantsAdmin({ project }) {
  const [members, setMembers] = useState([]);
  const [progressByUser, setProgressByUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    return Promise.all([
      supabase
        .from('project_members')
        .select('*, profile:profiles(nickname, phone)')
        .eq('project_id', project.id)
        .order('joined_at', { ascending: true }),
      supabase
        .from('user_mission_progress')
        .select('*, mission:missions(no, title, category:mission_categories(label, code))')
        .eq('project_id', project.id)
        .order('assigned_at', { ascending: true }),
    ]).then(([membersRes, progressRes]) => {
      setMembers(membersRes.data || []);
      const grouped = {};
      (progressRes.data || []).forEach((row) => {
        if (!grouped[row.user_id]) grouped[row.user_id] = [];
        grouped[row.user_id].push(row);
      });
      setProgressByUser(grouped);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const handleDelete = async (row) => {
    if (!confirm(`Mission ${row.mission?.no} (${row.mission?.title}) 기록을 삭제할까요?\n삭제하면 이 유저는 해당 미션을 다시 뽑을 수 있게 됩니다.`)) {
      return;
    }
    setDeletingId(row.id);
    const { error } = await supabase.from('user_mission_progress').delete().eq('id', row.id);
    setDeletingId(null);
    if (error) {
      alert(error.message);
      return;
    }
    load();
  };

  if (loading) return <p className="px-4 text-white/50 text-sm">불러오는 중...</p>;

  return (
    <div className="px-4 flex flex-col gap-4">
      <p className="text-sm text-white/50">
        {project.name} · 참여자 {members.length}명
      </p>

      {members.length === 0 && (
        <p className="text-white/50 text-sm">아직 참여한 사람이 없습니다.</p>
      )}

      {members.map((m) => {
        const missions = progressByUser[m.user_id] || [];
        return (
          <div key={m.id} className="bg-mission-card rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{m.profile?.nickname || '이름없음'}</p>
                <p className="text-xs text-white/50">
                  참여일 {new Date(m.joined_at).toLocaleDateString('ko-KR')} · 미션패스 사용{' '}
                  {m.pass_used_cnt}/{project.pass_cnt}
                </p>
              </div>
              <span className="text-xs text-white/50">
                {missions.length}/{project.max_mission}개 진행
              </span>
            </div>

            {missions.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-white/10 pt-2">
                {missions.map((row) => (
                  <div key={row.id} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-white/70">
                      Mission {row.mission?.no} · {row.mission?.title}
                      {row.mission?.category ? ` (${row.mission.category.label})` : ''}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-mission-dark text-white/60">
                        {STATUS_LABEL[row.status] || row.status}
                      </span>
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={deletingId === row.id}
                        className="text-xs text-red-400 underline disabled:opacity-40"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
