// Shared specification for the existing slide and future supplied slides.
export const SLIDE_FORMAT = {
  width: 1080,
  height: 1350,
  fps: 30,
  durationInFrames: 60,
} as const;

export const MOTION_END_FRAME = {
  slide1: 54, // 1.8 s: enter, traverse, leave.
  slide2: 54,
  slide3: 59, // Arrive at the stop on the final visible frame.
  slide4: 45, // Frames 45–59: stationary for 0.5 s.
} as const;
