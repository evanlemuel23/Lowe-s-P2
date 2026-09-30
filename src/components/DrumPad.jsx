export default function DrumPad({ sound, active, powered, onTrigger }) {
  return (
    <button
      className={`drum-pad pad-${sound.color}${active ? ' is-active' : ''}`}
      type="button"
      onClick={() => onTrigger(sound)}
      disabled={!powered}
      aria-label={`${sound.name}, keyboard key ${sound.key}`}
    >
      <span className="pad-key">{sound.key}</span>
      <span className="pad-name">{sound.name}</span>
      <span className="pad-type">{sound.type}</span>
    </button>
  );
}