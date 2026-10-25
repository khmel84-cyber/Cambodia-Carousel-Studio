import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {SlideTwo} from './SlideTwo';
import './preview.css';

const Preview = () => (
  <main>
    <h1>Cambodia · Слайд 02</h1>
    <p>Нажмите ▶, чтобы домик отправился по линии и прошёл петлю.</p>
    <div className="player">
      <Player
        component={SlideTwo}
        compositionWidth={1080}
        compositionHeight={1350}
        durationInFrames={180}
        fps={30}
        controls
        loop
        showVolumeControls={false}
        clickToPlay
        style={{width: '100%', aspectRatio: '4 / 5'}}
      />
    </div>
    <p className="details">6 секунд · 30 кадров/с · 1080 × 1350</p>
  </main>
);

createRoot(document.getElementById('root')!).render(<Preview />);
