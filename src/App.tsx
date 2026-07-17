import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { InfoCards } from "@/components/home/InfoCards";
import { BottomBanner } from "@/components/home/BottomBanner";
import { SECTION_IDS } from "@/lib/constants";
import { useTracking } from "@/hooks/useTracking";

/**
 * Application shell.
 * Stage 3 adds: TrackingDashboard (timeline + Mapbox map), What We Do,
 * Why Choose Us, Customer Reviews, Footer.
 */
export default function App() {
  const { state, track } = useTracking();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero onTrack={track} trackingLoading={state.status === "loading"} />
        <FeatureStrip />
        <InfoCards />
        <BottomBanner />

        {/* Stage 3 anchors */}
        <section id={SECTION_IDS.whatWeDo} aria-label="What we do" className="scroll-mt-28" />
        <section id={SECTION_IDS.whyChooseUs} aria-label="Why choose us" className="scroll-mt-28" />
        <section id={SECTION_IDS.reviews} aria-label="Customer reviews" className="scroll-mt-28" />
      </main>
      {/* Stage 3: <Footer /> */}
    </div>
  );
}
