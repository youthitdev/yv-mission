// 미션 카드 앞면 추상 패턴 모음 (정사각형 카드에 맞춰 100x100 좌표계로 통일)
// 모든 패턴은 preserveAspectRatio="none"으로 카드 비율에 꽉 차게 그림

function Base({ bg, children }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
      <rect width="100" height="100" fill={bg} />
      {children}
    </svg>
  );
}

function Scallop({ bg, fg }) {
  return (
    <Base bg={bg}>
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="50" cy={i * 35 + 10} rx="55" ry="20" fill={fg} />
      ))}
    </Base>
  );
}

function Sunburst({ bg, fg }) {
  const lines = Array.from({ length: 16 });
  return (
    <Base bg={bg}>
      <g transform="translate(50 50)">
        {lines.map((_, i) => {
          const angle = (i / lines.length) * Math.PI * 2;
          const x2 = Math.cos(angle) * 32;
          const y2 = Math.sin(angle) * 32;
          return <line key={i} x1="0" y1="0" x2={x2} y2={y2} stroke={fg} strokeWidth="4" />;
        })}
        <circle r="8" fill={fg} />
      </g>
    </Base>
  );
}

function DiamondChecker({ bg, fg }) {
  return (
    <Base bg={bg}>
      {[0, 1, 2, 3].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 50 + 10}
            y={row * 24 + 8}
            width="20"
            height="20"
            fill={(row + col) % 2 === 0 ? fg : bg}
            stroke={fg}
            strokeWidth={(row + col) % 2 === 0 ? 0 : 2}
            transform={`rotate(45 ${col * 50 + 20} ${row * 24 + 18})`}
          />
        ))
      )}
    </Base>
  );
}

function CenterCircle({ bg, fg }) {
  return (
    <Base bg={bg}>
      <circle cx="50" cy="50" r="26" fill={fg} />
    </Base>
  );
}

function Rings({ bg, fg }) {
  return (
    <Base bg={bg}>
      <circle cx="50" cy="50" r="34" fill={fg} opacity="0.35" />
      <circle cx="50" cy="50" r="23" fill={fg} opacity="0.6" />
      <circle cx="50" cy="50" r="12" fill={fg} />
    </Base>
  );
}

function VerticalStripes({ bg, fg }) {
  return (
    <Base bg={bg}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={i * 20} y="0" width="10" height="100" fill={fg} />
      ))}
    </Base>
  );
}

function HorizontalStripes({ bg, fg }) {
  return (
    <Base bg={bg}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="0" y={i * 20} width="100" height="10" fill={fg} />
      ))}
    </Base>
  );
}

function Triangle({ bg, fg }) {
  return (
    <Base bg={bg}>
      <polygon points="50,32 75,70 25,70" fill={fg} />
    </Base>
  );
}

function Arch({ bg, fg }) {
  return (
    <Base bg={bg}>
      <path d="M 30 85 L 30 55 A 20 20 0 0 1 70 55 L 70 85 Z" fill={fg} />
    </Base>
  );
}

function DotsScatter({ bg, fg }) {
  const dots = [
    [22, 22], [65, 18], [78, 45], [38, 48], [58, 68], [22, 75], [80, 78],
  ];
  return (
    <Base bg={bg}>
      {dots.map(([x, y], i) => (
        <rect key={i} x={x - 6} y={y - 6} width="12" height="12" fill={fg} transform={`rotate(45 ${x} ${y})`} />
      ))}
    </Base>
  );
}

function ChevronZigzag({ bg, fg }) {
  return (
    <Base bg={bg}>
      <polygon points="0,15 50,40 100,15 100,32 50,57 0,32" fill={fg} />
      <polygon points="0,55 50,80 100,55 100,72 50,97 0,72" fill={fg} />
    </Base>
  );
}

function SplitCurve({ bg, fg }) {
  return (
    <Base bg={bg}>
      <path d="M 0 0 L 65 0 Q 35 50 65 100 L 0 100 Z" fill={fg} />
    </Base>
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
