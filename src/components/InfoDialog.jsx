export default function InfoDialog({ title = '안내', message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-xs bg-white text-black rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <span className="font-semibold">{title}</span>
          <button onClick={onClose} className="text-black/40 text-lg leading-none">
            ✕
          </button>
        </div>
        <div className="px-4 py-5 text-sm leading-relaxed">{message}</div>
        <div className="px-4 pb-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-black/20 text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
