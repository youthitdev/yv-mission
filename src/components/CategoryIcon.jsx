// 카테고리 아이콘 (이모지 대신 앱 톤에 맞춘 커스텀 라인 아이콘)
// currentColor를 사용해서 타일이 하이라이트되면 자동으로 색이 바뀜

function Alone(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="24" cy="12" r="6" fill="currentColor" />
      <path
        d="M24 22c-8 0-13 5-13 15v3h26v-3c0-10-5-15-13-15Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function Together(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="17" cy="14" r="6" fill="currentColor" />
      <circle cx="31" cy="14" r="6" fill="currentColor" opacity="0.6" />
      <path
        d="M6 40v-2c0-8 5-12 11-12s11 4 11 12v2"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 40v-2c0-7 4.5-11 10-11s10 4 10 11v2"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

function Move(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M8 34c6 0 6-8 12-8s6 8 12 8 6-8 12-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="12" r="5" fill="currentColor" />
    </svg>
  );
}

function New(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M24 4 L28 19 L44 24 L28 29 L24 44 L20 29 L4 24 L20 19 Z"
        fill="currentColor"
      />
      <circle cx="38" cy="9" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function Observe(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M4 24C9 14 17 9 24 9s15 5 20 15c-5 10-13 15-20 15S9 34 4 24Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="24" r="7" fill="currentColor" />
    </svg>
  );
}

const ICONS = {
  alone: Alone,
  together: Together,
  move: Move,
  new: New,
  observe: Observe,
};

export default function CategoryIcon({ code, className = '' }) {
  const Icon = ICONS[code] || New;
  return <Icon className={className} />;
}
