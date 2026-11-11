import { Composition } from "remotion";
import { NarfidIntro } from "./Composition";
export const RemotionRoot = () => (
  <Composition
    id="NarfidIntro"
    component={NarfidIntro}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={1800}
  />
);
