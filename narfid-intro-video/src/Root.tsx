import { Composition, Folder } from "remotion";
import { ProductLaunchFilm } from "./product-launch/Film";
import { ProductOpening } from "./product-launch/Opening";
import { ProductMembership } from "./product-launch/Membership";
import { ProductHandoff } from "./product-launch/Handoff";
import { ProductKitchen } from "./product-launch/Kitchen";
import { ProductTogether } from "./product-launch/Together";
import { ProductClosing } from "./product-launch/Closing";
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
import { BrandMotionFilm } from "./brand-motion/Film";
import { BrandOpening } from "./brand-motion/Opening";
import { BrandDetails } from "./brand-motion/Details";
import { BrandTogether } from "./brand-motion/Together";
import { BrandPromise } from "./brand-motion/Promise";
import { BrandClosing } from "./brand-motion/Closing";
import { KitchenFilm } from "./kitchen/Film";
import { KitchenProduct } from "./kitchen/Product";
import { KitchenCaption } from "./kitchen/Caption";
import { KitchenClosing } from "./kitchen/Closing";
import { GateFilm } from "./gates/Film";
import { GateOpening } from "./gates/Opening";
import { GateMembership } from "./gates/Membership";
import { GateSync } from "./gates/Sync";
import { GateDecisions } from "./gates/Decisions";
import { GateLog } from "./gates/Log";
import { GateAssessment } from "./gates/Assessment";
import { GateClosing } from "./gates/Closing";
import { ClubDayFilm } from "./club-day/Film";
import { ClubDayOpening } from "./club-day/Opening";
import { ClubDayEnter } from "./club-day/Enter";
import { ClubDayMembership } from "./club-day/Membership";
import { ClubDayBooking } from "./club-day/Booking";
import { ClubDayCollection } from "./club-day/Collection";
import { ClubDayTogether } from "./club-day/Together";
import { ClubDayPromise } from "./club-day/Promise";
import { ClubDayClosing } from "./club-day/Closing";
import { FreezePolicyFilm } from "./freeze-policy/Film";
import { FreezeRequest } from "./freeze-policy/Request";
import { FreezePolicy } from "./freeze-policy/Policy";
import { FreezeSchedule } from "./freeze-policy/Schedule";
import { FreezeTimeline } from "./freeze-policy/Timeline";
import { FreezeResume } from "./freeze-policy/Resume";
import { FreezeClosing } from "./freeze-policy/Closing";
export const RemotionRoot = () => (
  <>
    <Composition id="NarfidFreezePolicy" component={FreezePolicyFilm} width={1920} height={1080} fps={30} durationInFrames={1440} />
    <Folder name="Freeze-Policy-Scenes">
      <Composition id="FreezeRequest" component={FreezeRequest} width={1920} height={1080} fps={30} durationInFrames={135} />
      <Composition id="FreezePolicy" component={FreezePolicy} width={1920} height={1080} fps={30} durationInFrames={285} />
      <Composition id="FreezeSchedule" component={FreezeSchedule} width={1920} height={1080} fps={30} durationInFrames={240} />
      <Composition id="FreezeTimeline" component={FreezeTimeline} width={1920} height={1080} fps={30} durationInFrames={225} />
      <Composition id="FreezeResume" component={FreezeResume} width={1920} height={1080} fps={30} durationInFrames={405} />
      <Composition id="FreezeClosing" component={FreezeClosing} width={1920} height={1080} fps={30} durationInFrames={150} />
    </Folder>
    <Composition
      id="NarfidClubDay"
      component={ClubDayFilm}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1800}
    />
    <Folder name="Club-Day-Scenes">
      <Composition
        id="ClubDayOpening"
        component={ClubDayOpening}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
      <Composition
        id="ClubDayEnter"
        component={ClubDayEnter}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
      <Composition
        id="ClubDayMembership"
        component={ClubDayMembership}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={270}
      />
      <Composition
        id="ClubDayBooking"
        component={ClubDayBooking}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={270}
      />
      <Composition
        id="ClubDayCollection"
        component={ClubDayCollection}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={270}
      />
      <Composition
        id="ClubDayTogether"
        component={ClubDayTogether}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
      />
      <Composition
        id="ClubDayPromise"
        component={ClubDayPromise}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={210}
      />
      <Composition
        id="ClubDayClosing"
        component={ClubDayClosing}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
    </Folder>
    <Composition
      id="NarfidProductLaunch"
      component={ProductLaunchFilm}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1440}
    />
    <Folder name="Product-Launch-Scenes">
      <Composition
        id="ProductOpening"
        component={ProductOpening}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
      <Composition
        id="ProductMembership"
        component={ProductMembership}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={282}
      />
      <Composition
        id="ProductHandoff"
        component={ProductHandoff}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={192}
      />
      <Composition
        id="ProductKitchen"
        component={ProductKitchen}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={492}
      />
      <Composition
        id="ProductTogether"
        component={ProductTogether}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={192}
      />
      <Composition
        id="ProductClosing"
        component={ProductClosing}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={162}
      />
    </Folder>
    <Composition
      id="NarfidGateIntegration"
      component={GateFilm}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1350}
    />
    <Folder name="Gate-Integration-Scenes">
      <Composition
        id="GateOpening"
        component={GateOpening}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
      />
      <Composition
        id="GateMembership"
        component={GateMembership}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
      <Composition
        id="GateSync"
        component={GateSync}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={210}
      />
      <Composition
        id="GateDecisions"
        component={GateDecisions}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
      />
      <Composition
        id="GateLog"
        component={GateLog}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
      />
      <Composition
        id="GateAssessment"
        component={GateAssessment}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
      />
      <Composition
        id="GateClosing"
        component={GateClosing}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
      />
    </Folder>
    <Composition
      id="NarfidKitchenJourney"
      component={KitchenFilm}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={900}
    />
    <Folder name="Kitchen-Journey-Scenes">
      <Composition
        id="KitchenProductJourney"
        component={KitchenProduct}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={780}
      />
      <Composition
        id="KitchenQuestion"
        component={KitchenCaption}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
        defaultProps={{
          title: "طلب العضو… وصل لأي مرحلة؟",
          note: "رحلة داخل المطبخ",
        }}
      />
      <Composition
        id="KitchenOrderDetails"
        component={KitchenCaption}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{
          title: "الوجبة واضحة. والكمية محدّدة.",
          note: "نراجع الطلب نفسه قبل بدء التحضير",
        }}
      />
      <Composition
        id="KitchenPreparing"
        component={KitchenCaption}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
        defaultProps={{
          title: "ابدأ التحضير.",
          note: "وتابع انتقال الطلب إلى «قيد التحضير»",
        }}
      />
      <Composition
        id="KitchenTimePassage"
        component={KitchenCaption}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={60}
        defaultProps={{
          title: "بعد انتهاء التحضير…",
          note: "يحدّث موظف المطبخ حالة الطلب",
        }}
      />
      <Composition
        id="KitchenReady"
        component={KitchenCaption}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
        defaultProps={{
          title: "الطلب جاهز للتسليم.",
          note: "نفس الطلب. والخطوة التالية واضحة.",
        }}
      />
      <Composition
        id="KitchenDelivery"
        component={KitchenCaption}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={69}
        defaultProps={{
          title: "بعد تسليم الوجبة…",
          note: "نضغط «تسليم وإكمال»",
        }}
      />
      <Composition
        id="KitchenCompleted"
        component={KitchenCaption}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={81}
        defaultProps={{
          title: "تم التسليم. واكتمل الطلب.",
          note: "يخرج الطلب من قائمة الطلبات النشطة",
        }}
      />
      <Composition
        id="KitchenClosing"
        component={KitchenClosing}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
      />
    </Folder>
    <Composition id="NarfidBrandMotion" component={BrandMotionFilm} width={1080} height={1920} fps={30} durationInFrames={900} />
    <Folder name="Brand-Motion-Scenes">
      <Composition id="BrandOpening" component={BrandOpening} width={1080} height={1920} fps={30} durationInFrames={150} />
      <Composition id="BrandDetails" component={BrandDetails} width={1080} height={1920} fps={30} durationInFrames={225} />
      <Composition id="BrandTogether" component={BrandTogether} width={1080} height={1920} fps={30} durationInFrames={195} />
      <Composition id="BrandPromise" component={BrandPromise} width={1080} height={1920} fps={30} durationInFrames={180} />
      <Composition id="BrandClosing" component={BrandClosing} width={1080} height={1920} fps={30} durationInFrames={150} />
    </Folder>
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
