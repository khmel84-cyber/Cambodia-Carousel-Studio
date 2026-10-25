import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {SlideTwo} from './SlideTwo';
import {SLIDE_FORMAT} from './timing';
import './preview.css';

const Preview = () => (
  <main>
    <h1>Cambodia · Слайд 02</h1>
    <p>Нажмите ▶, чтобы домик отправился по линии и прошёл петлю.</p>
    <div className="player">
      <Player
        component={SlideTwo}
        compositionWidth={SLIDE_FORMAT.width}
        compositionHeight={SLIDE_FORMAT.height}
        durationInFrames={SLIDE_FORMAT.durationInFrames}
        fps={SLIDE_FORMAT.fps}
        controls
        loop
        showVolumeControls={false}
        clickToPlay
        style={{width: '100%', aspectRatio: '4 / 5'}}
      />
    </div>
    <p className="details">2 секунды · 60 кадров · 30 кадров/с · 1080 × 1350</p>
  </main>
);

createRoot(document.getElementById('root')!).render(<Preview />);
