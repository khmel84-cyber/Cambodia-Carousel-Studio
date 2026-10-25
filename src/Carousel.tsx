import type {CSSProperties} from 'react';
import {AbsoluteFill, Composition, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {svgPathProperties} from 'svg-path-properties';
import {ROUTE} from './SlideTwo';

export type SlideNumber = 1 | 2 | 3 | 4;
export type SlideProps = {slide: SlideNumber; photo?: string};
const cream = '#F1EBDD';
const terracotta = '#B7654D';
// Uniform scaling and translation preserve the original second-slide loop.
let coordinate = 0;
const smallLoop = ROUTE.replace(/-?\d+(?:\.\d+)?/g, value => String(Number(value) * .35 + (coordinate++ % 2 === 0 ? 320 : 940)));
export const paths = {
  1: 'M -80 1240 C 40 1240 90 1190 155 1210 C 240 1240 280 1230 340 1230 L 1160 1230',
  2: `M -80 1230.5 L 355 1230.5 ${smallLoop.slice(smallLoop.indexOf('C'))} L 1160 1230.5`,
  3: 'M -80 1225 C 120 1180 160 1190 300 1240 C 450 1290 610 1260 740 1215 C 870 1160 910 1260 1005 1220 C 1040 1205 1050 1180 1025 1180 C 990 1180 1000 1220 1040 1220',
  4: 'M -80 1180 C 100 1120 190 1170 340 1205 C 530 1250 810 1215 1020 1215',
};
const routeProperties = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, new svgPathProperties(path)])) as Record<SlideNumber, InstanceType<typeof svgPathProperties>>;

export const House = () => <g fill={terracotta} stroke="#12363B" strokeWidth="5" strokeLinejoin="round">
  <path d="M -41 -48 L -41 -3 Q -41 0 -38 0 L 38 0 Q 41 0 41 -3 L 41 -48 Z" />
  <path d="M -54 -46 L 0 -94 L 54 -46 Z" />
  <path d="M -10 0 V -29 Q -10 -35 -4 -35 H 4 Q 10 -35 10 -29 V 0" fill="#12363B" stroke="none" />
  <rect x="-29" y="-40" width="12" height="13" rx="2" fill={cream} stroke="none" />
  <rect x="17" y="-40" width="12" height="13" rx="2" fill={cream} stroke="none" />
</g>;

const Heading = ({children, style}: {children: React.ReactNode; style?: CSSProperties}) => <div style={{position: 'absolute', fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, fontSize: 86, lineHeight: 1.02, letterSpacing: -2.5, ...style}}>{children}</div>;
const Accent = ({children}: {children: React.ReactNode}) => <span style={{color: '#DE8A6D'}}>{children}</span>;
const Feature = ({x, kind, title, subtitle}: {x:number; kind:'key'|'gear'|'coins';title:string;subtitle:string}) => <g transform={`translate(${x} 715)`} fill="none" stroke={cream} strokeWidth="2.5">
  <circle cx="53" cy="53" r="52" />
  {kind === 'key' ? <path d="M 38 66 L 66 38 A 14 14 0 1 0 53 24 A 14 14 0 0 0 48 47 L 28 68 L 28 80 L 39 80 L 39 72 L 47 72 M 64 29 L 65 30" /> : kind === 'gear' ? <><path d="M 45 25 L 59 25 L 62 35 L 71 39 L 81 36 L 87 48 L 79 56 L 79 64 L 85 72 L 76 82 L 65 77 L 58 81 L 56 91 L 43 91 L 40 80 L 31 76 L 22 79 L 16 67 L 24 60 L 24 51 L 18 43 L 27 33 L 37 38 L 44 35 Z" /><circle cx="52" cy="57" r="13" /></> : <><ellipse cx="53" cy="38" rx="23" ry="9" /><path d="M 30 38 V 72 C 30 85 76 85 76 72 V 38 M 30 49 C 30 62 76 62 76 49 M 30 60 C 30 73 76 73 76 60" /></>}
  <text x="0" y="153" fill={cream} stroke="none" fontFamily="Arial, sans-serif" fontSize="30">{title}</text>
  <text x="0" y="196" fill={cream} stroke="none" fontFamily="Arial, sans-serif" fontSize="24">{subtitle}</text>
</g>;

export const getHousePose = (slide: SlideNumber, frame: number) => {
  const motionEnd = slide < 3 ? 54 : slide === 3 ? 59 : 45;
  const progress = interpolate(frame, [0, motionEnd], [0, 1], {easing: Easing.bezier(.3, 0, .7, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const route = routeProperties[slide];
  // Slide 3 stops before the decorative loop, beside the accounting papers.
  const distance = route.getTotalLength() * progress * (slide === 3 ? .77 : slide === 4 ? .91 : 1);
  const point = route.getPointAtLength(distance);
  const tangent = route.getTangentAtLength(distance);
  return {x:point.x,y:point.y,angle:Math.max(-8,Math.min(8,tangent.y*8))};
};

export const CarouselSlide = ({slide, photo}: SlideProps) => {
  const frame = useCurrentFrame();
  const pose = getHousePose(slide,frame);
  const positions = {1:'0% 0%',2:'100% 0%',3:'0% 100%',4:'100% 100%'};
  return <AbsoluteFill data-export-canvas="true" data-export-slide={slide} style={{backgroundColor:'#12363B',color:cream,fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0, ...(slide===2?{right:'55%'}:{}) ,overflow:'hidden'}}>
      {photo ? <div style={{width:'100%',height:'100%',backgroundImage:`url("${photo}")`,backgroundSize:'cover',backgroundPosition:'center'}} /> : <div style={{width:'100%',height:'100%',backgroundImage:`url("${staticFile('photos/reference-backgrounds.png')}")`,backgroundSize:'200% 200%',backgroundPosition:positions[slide]}} />}
    </div>
    <AbsoluteFill style={{background: slide===1 ? 'linear-gradient(180deg, transparent 23%, rgba(18,54,59,.12) 38%, #102F32 76%)' : slide===2 ? 'linear-gradient(180deg, transparent 55%, #102F32 90%)' : slide===3 ? 'linear-gradient(90deg, rgba(10,37,40,.94), rgba(10,37,40,.57) 70%, rgba(10,37,40,.22))' : 'linear-gradient(90deg, rgba(10,37,40,.94), rgba(10,37,40,.74) 39%, transparent 78%)'}} />
    <div style={{position:'absolute',left:60,top:65,fontSize:27}}>{String(slide).padStart(2,'0')} / 04</div>
    {slide===1 && <Heading style={{left:100,top:675,fontSize:88}}>Квартира<br/>с видом на море.<br/><Accent>Я бы не спешил<br/>её покупать.</Accent></Heading>}
    {slide===2 && <><Heading style={{left:510,top:200,fontSize:81}}>Что меня<br/>интересует<br/>больше, чем<br/>вид из окна?</Heading><div style={{position:'absolute',left:515,top:720,fontSize:43,lineHeight:1.4}}><span style={{display:'inline-block',background:terracotta,borderRadius:45,padding:'6px 23px',marginRight:15}}>КТО</span>будет снимать<br/>эту квартиру?</div></>}
    {slide===3 && <><Heading style={{left:78,top:155,fontSize:82}}>Сколько останется<br/>после всех <Accent>расходов?</Accent></Heading><div style={{position:'absolute',left:88,top:405,fontSize:35,lineHeight:1.3}}>Красивые фотографии<br/>не показывают итоговую<br/>доходность.</div><svg width="1080" height="1350" style={{position:'absolute'}}><Feature x={88} kind="key" title="Аренда" subtitle="Ставка и загрузка"/><Feature x={390} kind="gear" title="Управление" subtitle="Комиссия и сервис"/><Feature x={685} kind="coins" title="Обслуживание" subtitle="Платежи и налоги"/><path d="M 348 735 V 910 M 642 735 V 910" stroke={cream} strokeWidth="1" opacity=".5"/></svg></>}
    {slide===4 && <><Heading style={{left:65,top:175,fontSize:86}}>Сначала<br/>считаем.<br/><Accent>Потом<br/>покупаем.</Accent></Heading><div style={{position:'absolute',left:68,top:695,fontSize:32,lineHeight:1.3}}><strong>Александр Хмелёв</strong><div style={{fontSize:27,marginTop:14}}>Живу в Камбодже.<br/>Разбираю недвижимость<br/>не только по красивым<br/>фотографиям.</div></div><div style={{position:'absolute',left:68,top:965,background:terracotta,border:'2px solid #DA9378',borderRadius:36,padding:'18px 32px',fontSize:30,lineHeight:1.3}}>Подписывайтесь —<br/>будем разбираться вместе.</div></>}
    <svg width="1080" height="1350" style={{position:'absolute',inset:0}} aria-label="Домик движется по линии">
      <path d={paths[slide]} fill="none" stroke={cream} strokeWidth="3" strokeLinecap="round" />
      {slide!==3 && <path d={slide===4?'M 1008 1203 L 1020 1215 L 1008 1227':slide===2?'M 1008 1218.5 L 1020 1230.5 L 1008 1242.5':'M 1008 1218 L 1020 1230 L 1008 1242'} fill="none" stroke={cream} strokeWidth="3"/>}
      <g data-house="true" transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle}) scale(.65)`}><House/></g>
    </svg>
  </AbsoluteFill>;
};

export const CarouselRoot = () => <>
  <Composition id="SlideOne" component={CarouselSlide} width={1080} height={1350} fps={30} durationInFrames={60} defaultProps={{slide:1 as const}} />
  <Composition id="SlideTwo" component={CarouselSlide} width={1080} height={1350} fps={30} durationInFrames={60} defaultProps={{slide:2 as const}} />
  <Composition id="SlideThree" component={CarouselSlide} width={1080} height={1350} fps={30} durationInFrames={60} defaultProps={{slide:3 as const}} />
  <Composition id="SlideFour" component={CarouselSlide} width={1080} height={1350} fps={30} durationInFrames={60} defaultProps={{slide:4 as const}} />
</>;
