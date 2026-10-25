import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {CarouselSlide, type SlideNumber} from './Carousel';
import {loadPhotos, savePhoto} from './photoStore';
import {exportVideo, type ExportedVideo} from './exportVideo';
import './preview.css';

const numbers=[1,2,3,4] as const;
const Preview = () => {
  const [slide,setSlide]=useState<SlideNumber>(1);
  const [photos,setPhotos]=useState<Partial<Record<SlideNumber,string>>>({});
  const [loaded,setLoaded]=useState(false);
  const [status,setStatus]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [exportSlide,setExportSlide]=useState<SlideNumber>(1);
  const [exportPhoto,setExportPhoto]=useState<string>();
  const [videos,setVideos]=useState<ExportedVideo[]>([]);
  const player=useRef<PlayerRef>(null);
  const exportRoot=useRef<HTMLDivElement>(null);
  const abort=useRef<AbortController|null>(null);
  const resultRefs=useRef<ExportedVideo[]>([]);
  useEffect(()=>{
    loadPhotos().then(setPhotos).catch(()=>setError('Не удалось восстановить фото. Выберите их снова.')).finally(()=>setLoaded(true));
    return ()=>{abort.current?.abort();resultRefs.current.forEach(video=>URL.revokeObjectURL(video.url));};
  },[]);
  const clearVideos=()=>{resultRefs.current.forEach(video=>URL.revokeObjectURL(video.url));resultRefs.current=[];setVideos([]);};
  const select=(next:SlideNumber)=>{setSlide(next);player.current?.pause();player.current?.seekTo(0);};
  const updatePhoto=async(file:File|null)=>{
    const selected=slide;setError('');clearVideos();
    const url=file?URL.createObjectURL(file):undefined;
    setPhotos(previous=>{if(previous[selected])URL.revokeObjectURL(previous[selected]!);return {...previous,[selected]:url};});
    try{await savePhoto(selected,file);setStatus(file?'Фото сохранено в этом браузере.':'Восстановлен образец.');}
    catch{setError('Фото доступно сейчас, но сохранить его на устройстве не удалось. Не закрывайте страницу до экспорта.');}
  };
  const startExport=async(all:boolean)=>{
    if(busy)return;setBusy(true);setError('');clearVideos();player.current?.pause();
    const controller=new AbortController();abort.current=controller;
    const selected=all?numbers:[slide];
    try{
      for(const n of selected){
        setExportSlide(n);setExportPhoto(photos[n]);
        await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
        const element=exportRoot.current?.querySelector<HTMLElement>('[data-export-canvas]');
        if(!element||element.dataset.exportSlide!==String(n))throw new Error('Не удалось подготовить слайд.');
        const result=await exportVideo(element,n,photos[n],message=>setStatus(`Слайд ${n} / 4 · ${message}`),controller.signal, new URLSearchParams(location.search).has('software-export'));
        resultRefs.current.push(result);setVideos([...resultRefs.current]);
      }
      setStatus(all?'Все 4 MP4 готовы. Сохраните каждый файл ниже.':'MP4 готов. Нажмите «Сохранить» ниже.');
    }catch(cause){setError(controller.signal.aborted?'Экспорт отменён. Уже готовые файлы можно сохранить.':cause instanceof Error?cause.message:'Экспорт не удался. Попробуйте один слайд.');}
    finally{setBusy(false);abort.current=null;}
  };
  const share=async(video:ExportedVideo)=>{
    if(navigator.canShare?.({files:[video.file]})){
      try{await navigator.share({files:[video.file]});}catch(cause){if(!(cause instanceof DOMException&&cause.name==='AbortError'))setError('Не удалось открыть меню. Нажмите ссылку «Скачать файл».');}
    }else{const link=document.createElement('a');link.href=video.url;link.download=video.file.name;link.click();}
  };
  return <main>
    <header><h1>Cambodia · Carousel Studio</h1><p>Выберите слайд и нажмите ▶</p></header>
    <nav aria-label="Выбор слайда">{numbers.map(n=><button disabled={busy} key={n} aria-pressed={slide===n} onClick={()=>select(n)}>{String(n).padStart(2,'0')}</button>)}</nav>
    <div className="player"><Player ref={player} key={slide} component={CarouselSlide} inputProps={{slide,photo:photos[slide]}} compositionWidth={1080} compositionHeight={1350} durationInFrames={60} fps={30} controls={false} loop showVolumeControls={false} clickToPlay style={{width:'100%',aspectRatio:'4 / 5'}} /></div>
    <div className="playback"><button onClick={()=>{player.current?.seekTo(0);player.current?.play();}}>▶ Воспроизвести</button><button onClick={()=>player.current?.pause()}>Пауза</button></div>
    <div className="navigation"><button disabled={busy} onClick={()=>select((slide===1?4:slide-1) as SlideNumber)}>← Назад</button><span>{slide} / 4</span><button disabled={busy} onClick={()=>select((slide===4?1:slide+1) as SlideNumber)}>Далее →</button></div>
    <p className="details">2 секунды · 60 кадров · 1080 × 1350</p>
    <section className="exports" aria-label="Экспорт видео">
      <button disabled={busy||!loaded} onClick={()=>startExport(false)}>Скачать MP4</button>
      <button disabled={busy||!loaded} onClick={()=>startExport(true)}>Скачать все 4 видео</button>
      <p>H.264 · без звука. Фото и видео обрабатываются на устройстве. Не закрывайте Safari во время экспорта.</p>
      {!photos[slide]&&<p>На этом слайде сейчас фото-образец. Если вы выбирали своё фото в прежней версии, выберите его ещё раз перед экспортом.</p>}
      <p>Фото-образцы используются на слайдах: {numbers.filter(n=>!photos[n]).join(', ')||'ни на одном — все ваши фото загружены'}.</p>
      <p role="status" aria-live="polite">{status}</p>
      {error&&<p role="alert">{error}</p>}
      {busy&&<button onClick={()=>abort.current?.abort()}>Отменить экспорт</button>}
      {videos.map(video=><article className="export-result" key={video.slide}>
        <strong>Слайд {video.slide} · MP4 готов</strong>
        <video controls playsInline muted preload="metadata" src={video.url} aria-label={`Готовое видео ${video.slide}`}/>
        <button onClick={()=>share(video)}>Сохранить слайд {video.slide}</button>
        <a href={video.url} download={video.file.name}>Скачать файл</a>
      </article>)}
    </section>
    <details><summary>Заменить фотографию слайда {slide}</summary><p>Чистое фото без надписей. Фото сохраняется только в этом браузере на устройстве и не публикуется.</p><input disabled={busy||!loaded} aria-label="Загрузить фотографию" type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file)void updatePhoto(file);e.target.value='';}}/><button disabled={busy||!loaded} onClick={()=>void updatePhoto(null)}>Вернуть образец</button></details>
    {slide===4&&!photos[4]&&<p className="details">Портрет временный — его можно заменить вашим фото.</p>}
    {busy&&<div ref={exportRoot} className="export-stage" aria-hidden="true"><Player key={exportSlide} component={CarouselSlide} inputProps={{slide:exportSlide,photo:exportPhoto}} compositionWidth={1080} compositionHeight={1350} durationInFrames={60} fps={30} controls={false} style={{width:1080,height:1350}} /></div>}
  </main>;
};
createRoot(document.getElementById('root')!).render(<Preview/>);
