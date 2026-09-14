// Tiny animated equalizer meter — pure CSS keyframes (see .eq-bars / .eq-bar
// in globals.css), used anywhere we want to signal "audio / drum kit"
// content without loading a real waveform. Purely decorative.
export default function EqualizerBars({
  bars = 6,
  className = "",
}: {
  bars?: number;
  className?: string;
}) {
  return (
    <div className={`eq-bars ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className="eq-bar" />
      ))}
    </div>
  );
}
