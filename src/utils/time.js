// 남은 시간을 "N일 HH:MM:SS" 형태로 변환
export function formatRemaining(msRemaining) {
  if (msRemaining <= 0) return '0일 00:00:00';
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${days}일 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function msUntil(isoDate) {
  return new Date(isoDate).getTime() - Date.now();
}
