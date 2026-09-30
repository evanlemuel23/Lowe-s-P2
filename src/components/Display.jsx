export default function Display({ sound, powered, volume }) {
  return (
    <section className={`display${powered ? '' : ' display-off'}`} aria-live="polite">
      <div className="display-topline">
        <span className="display-brand">ROOM 09 <i /></span>
        <span className="display-status"><i />{powered ? 'SYSTEM READY' : 'POWER DOWN'}</span>
      </div>
      <div className="display-reading">
        <div className="reading-label">{sound ? 'NOW PLAYING' : 'DRUM COMPUTER'}</div>
        <div className="reading-name">{powered ? sound?.name ?? 'Ready to play' : 'Standby'}</div>
        <div className="reading-meta">{powered && sound ? `${sound.type}  /  KEY ${sound.key}` : '9 VOICES  /  LIVE INPUT'}</div>
      </div>
      <div className="display-meter" aria-label={`Master volume ${Math.round(volume * 100)} percent`}>
        <span>OUT</span>
        <div className="meter-track"><i style={{ width: `${volume * 100}%` }} /></div>
        <strong>{Math.round(volume * 100).toString().padStart(2, '0')}</strong>
      </div>
    </section>
  );
}