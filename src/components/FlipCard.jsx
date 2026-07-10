export default function FlipCard({ flipped, front, back, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`flip-card aspect-square cursor-pointer ${flipped ? 'flipped' : ''} ${className}`}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">{front}</div>
        <div className="flip-card-back">{back}</div>
      </div>
    </div>
  );
}
