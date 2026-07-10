import { useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from('profiles')
      .update({ nickname, phone })
      .eq('id', profile.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      refreshProfile();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <Header />
      <h2 className="px-4 text-lg font-semibold mb-3">정보수정</h2>

      <form onSubmit={handleSave} className="flex flex-col gap-4 px-4">
        <div>
          <label className="text-xs text-white/50 block mb-1">닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full bg-mission-card rounded-lg px-3 py-2 border border-white/10"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">연락처</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-mission-card rounded-lg px-3 py-2 border border-white/10"
            placeholder="010-0000-0000"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 py-3 rounded-xl bg-mission-accent text-black font-semibold disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        {saved && <p className="text-center text-sm text-mission-accent">저장되었습니다.</p>}
      </form>
    </div>
  );
}
