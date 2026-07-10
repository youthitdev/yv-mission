// mission_categories 테이블과 매핑되는 카테고리 메타 정보 (아이콘/색상 등 UI 전용 값)
export const CATEGORY_META = {
  alone: { label: '혼자', emoji: '🧘' },
  together: { label: '함께', emoji: '🤝' },
  move: { label: '이동', emoji: '🚶' },
  new: { label: '새로움', emoji: '✨' },
  observe: { label: '관찰', emoji: '👀' },
};

export function getCategoryMeta(code) {
  return CATEGORY_META[code] || { label: code, emoji: '❓' };
}
