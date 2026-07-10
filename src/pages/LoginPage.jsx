import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithKakao, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        setMessage('가입 완료! 이제 로그인해주세요. (이메일 인증이 꺼져있으면 바로 로그인 가능)');
        setMode('signin');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setMessage(err.message || '오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">발견미션</h1>
        <p className="text-white/60 text-sm">나를 찾는 시간, 미션으로 채워보세요</p>
      </div>
      <button
        onClick={loginWithKakao}
        className="w-full max-w-xs py-3 rounded-xl bg-[#FEE500] text-black font-semibold flex items-center justify-center gap-2"
      >
        <span>카카오로 로그인</span>
      </button>

      <div className="w-full max-w-xs flex items-center gap-3 text-white/30 text-xs">
        <div className="flex-1 h-px bg-white/10" />
        임시 테스트 로그인
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-2">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-mission-card rounded-lg px-3 py-2 border border-white/10 text-sm"
          required
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-mission-card rounded-lg px-3 py-2 border border-white/10 text-sm"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="py-2 rounded-lg bg-mission-card border border-white/10 text-sm font-medium disabled:opacity-50"
        >
          {mode === 'signup' ? (busy ? '가입 중...' : '테스트 계정 만들기') : busy ? '로그인 중...' : '테스트 로그인'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          className="text-xs text-white/40 underline"
        >
          {mode === 'signup' ? '이미 계정이 있어요' : '처음이에요, 계정 만들기'}
        </button>
        {message && <p className="text-xs text-white/60 text-center mt-1">{message}</p>}
      </form>
    </div>
  );
}
