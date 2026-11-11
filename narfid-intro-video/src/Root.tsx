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
import { ShiftFilm } from "./nv001/Film";
import { ShiftOpening } from "./nv001/Opening";
import { ShiftHandoff } from "./nv001/Handoff";
import { ShiftCases } from "./nv001/Cases";
import { ShiftChallenge } from "./nv001/Challenge";
import { ShiftClosing } from "./nv001/Closing";
import { BookingStudy } from "./booking-study/Film";
import { ShiftEffectsCut } from "./nv001/EffectsCut";
import { ReservationHandoff, reservationHandoffFrames } from "./nv001/ReservationHandoff";
import { ReservationFilm } from "./nv001/ReservationFilm";
import { ClubOverviewStudy } from "./ClubOverviewStudy";
import { ClubStoryStudy } from "./ClubStoryStudy";
import { BrandMotionStudy, ClubMomentStudy } from "./DirectionStudies";
import { OrbitFilm, OrbitStudy } from "./OrbitStudy";
export const RemotionRoot = () => (
  <>
    <Composition id="OrbitFilm" component={OrbitFilm} width={1080} height={1920} fps={30} durationInFrames={450} />
    <Composition id="OrbitStudy" component={OrbitStudy} width={1080} height={1920} fps={30} durationInFrames={390} />
    <Composition id="BrandMotionStudy" component={BrandMotionStudy} width={1080} height={1920} fps={30} durationInFrames={360} />
    <Composition id="ClubMomentStudy" component={ClubMomentStudy} width={1080} height={1920} fps={30} durationInFrames={reservationHandoffFrames + 90} />
    <Composition id="ClubStoryStudy" component={ClubStoryStudy} width={1080} height={1920} fps={30} durationInFrames={390} />
    <Composition id="ClubOverviewStudy" component={ClubOverviewStudy} width={1080} height={1920} fps={30} durationInFrames={390} />
    <Composition
      id="NarfidReservationFilm"
      component={ReservationFilm}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={reservationHandoffFrames + 60}
    />
    <Composition
      id="NV001-ReservationHandoff"
      component={ReservationHandoff}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={reservationHandoffFrames}
    />
    <Composition
      id="NV001-EffectsCut"
      component={ShiftEffectsCut}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1110}
    />
    <Composition
      id="NarfidBookingStudy"
      component={BookingStudy}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={315}
    />
    <Composition
      id="NV001-MusicOnly"
      component={ShiftFilm}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1110}
      defaultProps={{
        signatureFile: "nv001/narfid-sonic-v1.wav",
      }}
    />
    <Composition
      id="NV001-VisualPreview"
      component={ShiftFilm}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1110}
      defaultProps={{ signatureFile: "" }}
    />
    <Folder name="NV001-Scenes">
      <Composition
        id="NV001-Opening"
        component={ShiftOpening}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={165}
      />
      <Composition
        id="NV001-Handoff"
        component={ShiftHandoff}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={315}
      />
      <Composition
        id="NV001-Cases"
        component={ShiftCases}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={390}
      />
      <Composition
        id="NV001-Challenge"
        component={ShiftChallenge}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={150}
      />
      <Composition
        id="NV001-Closing"
        component={ShiftClosing}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={90}
      />
    </Folder>
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
