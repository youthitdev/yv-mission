// 미션 카드 앞면에 쓰는 색상 팔레트 (업로드해주신 디자인 톤 참고)
export const PALETTE = {
  pink: '#F3A9CC',
  pinkDeep: '#FDB6D8',
  orange: '#FF7A3D',
  yellow: '#ECD02E',
  green: '#1C9142',
  greenLight: '#6FAF3A',
  teal: '#05AFC9',
  tealBright: '#1BD8F5',
  black: '#1A1A1A',
  offwhite: '#ECECEC',
};

// 배경/전경 2색 조합 목록 (앞면 카드마다 랜덤하게 배정)
export const COLOR_PAIRS = [
  [PALETTE.pink, PALETTE.orange],
  [PALETTE.orange, PALETTE.yellow],
  [PALETTE.yellow, PALETTE.green],
  [PALETTE.green, PALETTE.teal],
  [PALETTE.teal, PALETTE.tealBright],
  [PALETTE.black, PALETTE.yellow],
  [PALETTE.pink, PALETTE.green],
  [PALETTE.offwhite, PALETTE.teal],
  [PALETTE.orange, PALETTE.black],
  [PALETTE.pinkDeep, PALETTE.green],
];
