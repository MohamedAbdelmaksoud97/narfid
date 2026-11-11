import { Composition, Folder } from "remotion";
import { NarfidIntro } from "./Composition";
import { DirectorCut } from "./DirectorCut";
import { MembersApp } from "./MembersApp";
import { Opening } from "./members/Opening";
import { Subscribe } from "./members/Subscribe";
import { Payment } from "./members/Payment";
import { Renew } from "./members/Renew";
import { Freeze } from "./members/Freeze";
import { Closing } from "./members/Closing";
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
    <Composition
      id="NarfidMembersApp"
      component={MembersApp}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1380}
    />
    <Folder name="Members-App-Scenes">
      <Composition
        id="MembersOpening"
        component={Opening}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
      <Composition
        id="MembersSubscribe"
        component={Subscribe}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
      />
      <Composition
        id="MembersPayment"
        component={Payment}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={270}
      />
      <Composition
        id="MembersRenew"
        component={Renew}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
      />
      <Composition
        id="MembersFreeze"
        component={Freeze}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={270}
      />
      <Composition
        id="MembersClosing"
        component={Closing}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
    </Folder>
  </>
);
