import html2canvas from 'html2canvas';
import {renderToStaticMarkup} from 'react-dom/server';
import {getHousePose, House, type SlideNumber} from './Carousel';

export type ExportedVideo = {slide:SlideNumber;url:string;file:File};
export type ExportProgress = (message:string)=>void;
const WIDTH=1080, HEIGHT=1350, FPS=30, FRAMES=60;

const imageFromUrl = (url:string) => new Promise<HTMLImageElement>((resolve,reject)=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Не удалось прочитать фотографию или SVG. Выберите фото ещё раз.'));image.src=url;
});
const toPng = (canvas:HTMLCanvasElement) => new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Не удалось подготовить кадр.')),'image/png'));

export async function exportVideo(element:HTMLElement,slide:SlideNumber,photo:string|undefined,onProgress:ExportProgress,signal:AbortSignal,forceSoftware=false):Promise<ExportedVideo> {
  const check=()=>{if(signal.aborted)throw new DOMException('Экспорт отменён','AbortError');};
  check();onProgress('Подготовка фотографии и надписей…');
  await document.fonts.ready;
  if(photo)await imageFromUrl(photo);
  // Capture at native resolution, not from the scaled on-screen player.
  // Static HTML, photographs, gradients and SVG are rasterized only once.
  const base=await html2canvas(element,{width:WIDTH,height:HEIGHT,scale:1,backgroundColor:'#12363B',logging:false,windowWidth:WIDTH,windowHeight:HEIGHT,imageTimeout:30000,
    onclone:doc=>doc.querySelectorAll('[data-house]').forEach(node=>node.remove())});
  check();
  if(base.width!==WIDTH||base.height!==HEIGHT)throw new Error('Неверный размер подготовленного кадра.');
  const svg=renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width="120" height="110" viewBox="-60 -100 120 110"><House/></svg>);
  const houseUrl=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  const house=await imageFromUrl(houseUrl);URL.revokeObjectURL(houseUrl);
  const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
  const context=canvas.getContext('2d');if(!context)throw new Error('Браузер не предоставил Canvas.');
  const draw=(frame:number)=>{
    check();context.clearRect(0,0,WIDTH,HEIGHT);context.drawImage(base,0,0);
    const pose=getHousePose(slide,frame);
    context.save();context.translate(pose.x,pose.y);context.rotate(pose.angle*Math.PI/180);context.scale(.65,.65);context.drawImage(house,-60,-100,120,110);context.restore();
  };
  let blob:Blob;
  const bunny=await import('mediabunny');
  let native=false;
  try{native=!forceSoftware&&await bunny.canEncodeVideo('avc',{width:WIDTH,height:HEIGHT,bitrate:6000000});}catch{/* Use software encoding below. */}
  if(native){
    const target=new bunny.BufferTarget();
    const output=new bunny.Output({format:new bunny.Mp4OutputFormat({fastStart:'in-memory'}),target});
    const source=new bunny.CanvasSource(canvas,{codec:'avc',bitrate:6000000});
    output.addVideoTrack(source,{frameRate:FPS});
    try{await output.start();for(let frame=0;frame<FRAMES;frame++){draw(frame);await source.add(frame/FPS,1/FPS);onProgress(`H.264: ${frame+1} / ${FRAMES} кадров`);}source.close();await output.finalize();check();if(!target.buffer)throw new Error('Кодировщик не вернул MP4.');blob=new Blob([target.buffer],{type:'video/mp4'});}
    catch(error){await output.cancel().catch(()=>{});check();onProgress('Встроенный кодировщик недоступен — переключение на локальный FFmpeg…');return exportVideo(element,slide,photo,onProgress,signal,true);}
  }else{
    onProgress('Загрузка локального H.264-кодировщика (около 32 МБ)…');
    const {FFmpeg}=await import('@ffmpeg/ffmpeg');
    const ffmpeg=new FFmpeg();
    const abort=()=>ffmpeg.terminate();signal.addEventListener('abort',abort,{once:true});
    const root=new URL('ffmpeg/',new URL(import.meta.env.BASE_URL,location.href));
    try{
      await ffmpeg.load({classWorkerURL:new URL('worker.js',root).href,coreURL:new URL('ffmpeg-core.js',root).href,wasmURL:new URL('ffmpeg-core.wasm',root).href});
      for(let frame=0;frame<FRAMES;frame++){
        draw(frame);const png=await toPng(canvas);await ffmpeg.writeFile(`frame-${String(frame).padStart(2,'0')}.png`,new Uint8Array(await png.arrayBuffer()));onProgress(`Подготовка: ${frame+1} / ${FRAMES} кадров`);
      }
      ffmpeg.on('progress',event=>onProgress(`H.264: ${Math.min(99,Math.round(event.progress*100))}%`));
      const code=await ffmpeg.exec(['-framerate','30','-i','frame-%02d.png','-frames:v','60','-an','-c:v','libx264','-preset','ultrafast','-threads','1','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart','output.mp4']);
      check();if(code!==0)throw new Error('Локальный кодировщик завершился с ошибкой. Попробуйте экспортировать один слайд и оставьте Safari открытым.');
      const bytes=await ffmpeg.readFile('output.mp4');if(typeof bytes==='string')throw new Error('Неверный ответ кодировщика.');
      blob=new Blob([new Uint8Array(bytes)],{type:'video/mp4'});
    }finally{signal.removeEventListener('abort',abort);ffmpeg.terminate();}
  }
  check();if(blob.size<1000)throw new Error('Пустое видео — файл не сохранён.');
  // Parse the completed MP4 without requiring autoplay permission in Safari.
  const input=new bunny.Input({source:new bunny.BlobSource(blob),formats:[bunny.MP4]});
  try{
    const track=await input.getPrimaryVideoTrack();
    const duration=await input.computeDuration();
    const audio=await input.getAudioTracks();
    if(!track||track.codec!=='avc'||track.displayWidth!==WIDTH||track.displayHeight!==HEIGHT||Math.abs(duration-2)>.01||audio.length)throw new Error('MP4 не прошёл проверку формата, размера или длительности.');
    const stats=await track.computePacketStats();
    if(stats.packetCount!==FRAMES||Math.abs(stats.averagePacketRate-FPS)>.1)throw new Error('MP4 не прошёл проверку 60 кадров / 30 FPS.');
  }finally{input.dispose();}
  const url=URL.createObjectURL(blob);
  const file=new File([blob],`Cambodia-slide-${String(slide).padStart(2,'0')}.mp4`,{type:'video/mp4'});
  onProgress('MP4 готов');return {slide,url,file};
}
