/** A post's lift as a colored pill, with an arrow so it never relies on color alone. */
export function LiftPill({ value, muted }: { value: number; muted?: boolean }) {
  const level = muted ? 'mid' : value >= 1.5 ? 'good' : value < 0.7 ? 'bad' : 'mid';
  const arrow = level === 'good' ? '▲ ' : level === 'bad' ? '▼ ' : '';
  const text = value > 0 && value < 0.1 ? '<0.1×' : `${value >= 10 ? value.toFixed(0) : value.toFixed(1)}×`;
  return (
    <span className={`lift-pill ${level}`} title={`${value.toFixed(2)}× a typical post on this account`}>
      <span aria-hidden>{arrow}</span>
      {text}
    </span>
  );
}
