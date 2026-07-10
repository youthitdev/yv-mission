import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import ProjectSelectDropdown from './ProjectSelectDropdown';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: '홈', path: '/' },
    { label: '미션선택', path: '/missions' },
    { label: '미션확인', path: '/history' },
    { label: '정보수정', path: '/profile' },
  ];

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <h1 className="font-bold text-lg">발견미션</h1>
      <button onClick={() => setOpen(true)} className="text-2xl leading-none px-2" aria-label="메뉴">
        ☰
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-mission-card p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <p className="font-semibold">{profile?.nickname || '이름없음'}</p>
              </div>
            </div>

            <ProjectSelectDropdown />

            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className="text-left py-2 px-1 rounded hover:bg-white/5"
                >
                  {item.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setOpen(false);
                  }}
                  className="text-left py-2 px-1 rounded hover:bg-white/5 text-mission-accent"
                >
                  ADMIN
                </button>
              )}
            </nav>

            <button
              onClick={logout}
              className="mt-auto text-left py-2 px-1 rounded hover:bg-white/5 text-white/60"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
