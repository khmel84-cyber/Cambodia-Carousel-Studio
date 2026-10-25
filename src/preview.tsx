import {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {CarouselSlide, type SlideNumber} from './Carousel';
import './preview.css';

const Preview = () => {
  const [slide, setSlide] = useState<SlideNumber>(1);
  const [photos, setPhotos] = useState<Partial<Record<SlideNumber,string>>>({});
  const player = useRef<PlayerRef>(null);
  const select = (next: SlideNumber) => {setSlide(next); player.current?.pause(); player.current?.seekTo(0);};
  return <main>
    <header><h1>Cambodia · Carousel Studio</h1><p>Выберите слайд и нажмите ▶</p></header>
    <nav aria-label="Выбор слайда">{([1,2,3,4] as const).map(n=><button key={n} aria-pressed={slide===n} onClick={()=>select(n)}>{String(n).padStart(2,'0')}</button>)}</nav>
    <div className="player"><Player ref={player} key={slide} component={CarouselSlide} inputProps={{slide,photo:photos[slide]}} compositionWidth={1080} compositionHeight={1350} durationInFrames={60} fps={30} controls={false} loop showVolumeControls={false} clickToPlay style={{width:'100%',aspectRatio:'4 / 5'}} /></div>
    <div className="playback"><button onClick={()=>{player.current?.seekTo(0);player.current?.play();}}>▶ Воспроизвести</button><button onClick={()=>player.current?.pause()}>Пауза</button></div>
    <div className="navigation"><button onClick={()=>select((slide===1?4:slide-1) as SlideNumber)}>← Назад</button><span>{slide} / 4</span><button onClick={()=>select((slide===4?1:slide+1) as SlideNumber)}>Далее →</button></div>
    <p className="details">2 секунды · 60 кадров · 1080 × 1350</p>
    <details><summary>Заменить фотографию слайда {slide}</summary><p>Чистое фото без надписей. Выбор хранится только до закрытия страницы и не публикуется.</p><input aria-label="Загрузить фотографию" type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(!file)return;const url=URL.createObjectURL(file);setPhotos(previous=>{if(previous[slide])URL.revokeObjectURL(previous[slide]!);return {...previous,[slide]:url};});}}/><button onClick={()=>setPhotos(previous=>{if(previous[slide])URL.revokeObjectURL(previous[slide]!);return {...previous,[slide]:undefined};})}>Вернуть образец</button></details>
    {slide===4 && <p className="details">Портрет временный — его можно заменить вашим фото.</p>}
  </main>;
};
createRoot(document.getElementById('root')!).render(<Preview/>);
