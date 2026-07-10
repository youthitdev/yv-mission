import { useMission } from '../context/MissionContext';

export default function ProjectSelectDropdown() {
  const { projects, currentProjectId, selectProject } = useMission();

  if (!projects.length) return null;

  return (
    <div className="pb-2">
      <label className="text-xs text-white/50 block mb-1">참여 기수</label>
      <select
        value={currentProjectId || ''}
        onChange={(e) => selectProject(e.target.value)}
        className="w-full bg-mission-dark rounded-lg px-3 py-2 text-sm border border-white/10"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
