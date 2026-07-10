import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithKakao } = useAuth();

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
    </div>
  );
}
