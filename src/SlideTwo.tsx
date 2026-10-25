import {AbsoluteFill, Composition, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {svgPathProperties} from 'svg-path-properties';

// The crossing and each cubic join share a horizontal tangent. The house
// follows this exact SVG path at constant arc-length speed through the loop.
export const ROUTE = 'M 100 830 C 230 830 360 740 540 740 C 780 740 880 510 720 440 C 560 370 340 480 340 600 C 340 710 440 740 540 740 C 720 740 820 830 980 830';
const route = new svgPathProperties(ROUTE);
const length = route.getTotalLength();

export const SlideTwo = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const progress = interpolate(frame, [0.35 * fps, durationInFrames - 0.35 * fps - 1], [0, 1], {
    easing: Easing.bezier(0.3, 0, 0.7, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const point = route.getPointAtLength(progress * length);
  const tangent = route.getTangentAtLength(progress * length);
  // A restrained lean keeps the house upright and readable around the loop.
  const lean = Math.max(-12, Math.min(12, tangent.y * 12));

  return (
    <AbsoluteFill style={{backgroundColor: '#12363B'}}>
      <svg width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-label="Терракотовый домик движется по молочной линии с плавной петлёй">
        <path d={ROUTE} fill="none" stroke="#F1EBDD" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <g transform={`translate(${point.x} ${point.y}) rotate(${lean})`}>
          <g fill="#B7654D" stroke="#12363B" strokeWidth="5" strokeLinejoin="round">
            <path d="M -41 -48 L -41 -3 Q -41 0 -38 0 L 38 0 Q 41 0 41 -3 L 41 -48 Z" />
            <path d="M -54 -46 L 0 -94 L 54 -46 Z" />
          </g>
          <path d="M -10 0 V -29 Q -10 -35 -4 -35 H 4 Q 10 -35 10 -29 V 0" fill="#12363B" />
          <rect x="-29" y="-40" width="12" height="13" rx="2" fill="#F1EBDD" />
          <rect x="17" y="-40" width="12" height="13" rx="2" fill="#F1EBDD" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="SlideTwo" component={SlideTwo} width={1080} height={1350} fps={30} durationInFrames={180} />
);
