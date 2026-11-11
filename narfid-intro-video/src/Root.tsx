import { Composition } from "remotion";
import { NarfidIntro } from "./Composition";
import { DirectorCut } from "./DirectorCut";
export const RemotionRoot = () => (
  <>
    <Composition
      id="NarfidIntro"
      component={DirectorCut}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1800}
    />
    <Composition
      id="NarfidIntroOriginal"
      component={NarfidIntro}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1800}
    />
  </>
);
