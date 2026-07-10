// 미션 카드 앞면 추상 패턴 모음 (제공해주신 디자인 톤을 참고해 재구성)
// 각 패턴은 (bg, fg) 두 색을 받아 100x140 비율의 svg를 그림

function Scallop({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" preserveAspectRatio="none" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx="50" cy={i * 35 + 5} rx="55" ry="22" fill={fg} />
      ))}
    </svg>
  );
}

function Sunburst({ bg, fg }) {
  const lines = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      <g transform="translate(50 70)">
        {lines.map((_, i) => {
          const angle = (i / lines.length) * Math.PI * 2;
          const x2 = Math.cos(angle) * 40;
          const y2 = Math.sin(angle) * 40;
          return <line key={i} x1="0" y1="0" x2={x2} y2={y2} stroke={fg} strokeWidth="4" />;
        })}
        <circle r="10" fill={fg} />
      </g>
    </svg>
  );
}

function DiamondChecker({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      {[0, 1, 2, 3].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 50}
            y={row * 35}
            width="30"
            height="30"
            fill={(row + col) % 2 === 0 ? fg : bg}
            stroke={fg}
            strokeWidth={(row + col) % 2 === 0 ? 0 : 2}
            transform={`rotate(45 ${col * 50 + 15} ${row * 35 + 15})`}
          />
        ))
      )}
    </svg>
  );
}

function CenterCircle({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      <circle cx="50" cy="70" r="26" fill={fg} />
    </svg>
  );
}

function Rings({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      <circle cx="50" cy="70" r="38" fill={fg} opacity="0.35" />
      <circle cx="50" cy="70" r="26" fill={fg} opacity="0.6" />
      <circle cx="50" cy="70" r="14" fill={fg} />
    </svg>
  );
}

function VerticalStripes({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={i * 20} y="0" width="10" height="140" fill={fg} />
      ))}
    </svg>
  );
}

function HorizontalStripes({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="0" y={i * 28} width="100" height="14" fill={fg} />
      ))}
    </svg>
  );
}

function Triangle({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      <polygon points="50,45 75,95 25,95" fill={fg} />
    </svg>
  );
}

function Arch({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      <path d="M 30 110 L 30 70 A 20 20 0 0 1 70 70 L 70 110 Z" fill={fg} />
    </svg>
  );
}

function DotsScatter({ bg, fg }) {
  const dots = [
    [20, 30], [60, 20], [75, 55], [35, 65], [55, 90], [20, 100], [80, 100],
  ];
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      {dots.map(([x, y], i) => (
        <rect key={i} x={x - 6} y={y - 6} width="12" height="12" fill={fg} transform={`rotate(45 ${x} ${y})`} />
      ))}
    </svg>
  );
}

function ChevronZigzag({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      <polygon points="0,20 50,50 100,20 100,45 50,75 0,45" fill={fg} />
      <polygon points="0,75 50,105 100,75 100,100 50,130 0,100" fill={fg} />
    </svg>
  );
}

function SplitCurve({ bg, fg }) {
  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect width="100" height="140" fill={bg} />
      <path d="M 0 0 L 65 0 Q 30 70 65 140 L 0 140 Z" fill={fg} />
    </svg>
  );
}

export const PATTERNS = [
  Scallop,
  Sunburst,
  DiamondChecker,
  CenterCircle,
  Rings,
  VerticalStripes,
  HorizontalStripes,
  Triangle,
  Arch,
  DotsScatter,
  ChevronZigzag,
  SplitCurve,
];
