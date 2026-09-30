import { useEffect, useRef, useState } from 'react';
import DrumPad from './components/DrumPad.jsx';
import Display from './components/Display.jsx';
import { playSound, soundBank } from './data/soundBank.js';

export default function App() {
  const [volume, setVolume] = useState(0.72);
  const [powered, setPowered] = useState(true);
  const [activeSound, setActiveSound] = useState(null);
  const audioContext = useRef(null);
  const masterGain = useRef(null);
  const activeTimer = useRef(null);

  useEffect(() => {
    if (masterGain.current && audioContext.current) {
      masterGain.current.gain.setTargetAtTime(volume, audioContext.current.currentTime, 0.015);
    }
  }, [volume]);

  useEffect(() => () => {
    window.clearTimeout(activeTimer.current);
    audioContext.current?.close();
  }, []);

  function triggerSound(sound) {
    if (!powered) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContext.current) {
      audioContext.current = new AudioContextClass();
      masterGain.current = audioContext.current.createGain();
      masterGain.current.gain.value = volume;
      masterGain.current.connect(audioContext.current.destination);
    }

    if (audioContext.current.state === 'suspended') audioContext.current.resume();
    playSound(audioContext.current, masterGain.current, sound.id);
    setActiveSound(sound);
    window.clearTimeout(activeTimer.current);
    activeTimer.current = window.setTimeout(() => setActiveSound(null), 700);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      const sound = soundBank.find((item) => item.key.toLowerCase() === event.key.toLowerCase());
      if (sound) {
        event.preventDefault();
        triggerSound(sound);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function togglePower() {
    const nextPower = !powered;
    setPowered(nextPower);
    setActiveSound(null);
    if (nextPower) audioContext.current?.resume();
    else audioContext.current?.suspend();
  }

  return (
    <main className="page-shell">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Room 09 home"><span>R</span>09</a>
        <div className="masthead-title"><span>INSTRUMENTS / 001</span><h1>Drum machine</h1></div>
        <div className="session-tag"><i /> SESSION 01 <span>LIVE</span></div>
      </header>

      <div className="machine" id="top">
        <div className="machine-heading">
          <div><span className="eyebrow">RHYTHM SECTION</span><h2>Room to make noise.</h2></div>
          <div className="voice-count"><b>09</b><span>VOICE<br />ENGINE</span></div>
        </div>

        <div className="console">
          <Display sound={activeSound} powered={powered} volume={volume} />

          <div className="control-strip">
            <div className="control-label"><span>MASTER</span><strong>OUTPUT LEVEL</strong></div>
            <label className="volume-control">
              <span className="volume-end">0</span>
              <input
                aria-label="Master volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                style={{ '--range-fill': `${volume * 100}%` }}
              />
              <span className="volume-end">10</span>
            </label>
            <button className={`power-button${powered ? ' is-on' : ''}`} type="button" onClick={togglePower} aria-pressed={powered}>
              <span className="power-lamp" />
              <span>{powered ? 'POWER ON' : 'POWER OFF'}</span>
            </button>
          </div>

          <div className="pad-section-heading">
            <span>PERFORMANCE PADS</span>
            <span className="key-hint"><i /> KEYBOARD MAPPED</span>
          </div>
          <div className="pad-grid">
            {soundBank.map((sound) => (
              <DrumPad
                key={sound.id}
                sound={sound}
                powered={powered}
                active={activeSound?.id === sound.id}
                onTrigger={triggerSound}
              />
            ))}
          </div>

          <footer className="console-footer">
            <span>Q W E <b>·</b> A S D <b>·</b> Z X C</span>
            <span>WEB AUDIO ENGINE <i /> ONLINE</span>
          </footer>
        </div>
      </div>

      <footer className="page-footer"><span>ROOM 09 AUDIO LAB</span><span>MAKE A BEAT / BREAK A PATTERN</span><span>V 1.0.0</span></footer>
    </main>
  );
}