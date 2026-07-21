import { useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { WhyChooseUsSection } from "@/components/home/why/WhyChooseUsSection";
import { ServicesSection } from "@/components/home/services/ServicesSection";
import { ReviewsSection } from "@/components/home/reviews/ReviewsSection";
import { TrackingDashboard } from "@/components/tracking/TrackingDashboard";
import { LoadingSkeleton } from "@/components/tracking/LoadingSkeleton";
import { SciFiBackdrop } from "@/components/ui/SciFiBackdrop";
import { useTracking } from "@/hooks/useTracking";

/**
 * Application shell.
 * The tracking dashboard renders directly beneath the hero once a lookup
 * succeeds, and the page auto-scrolls to it. Shared links (?track=NUMBER)
 * start the lookup automatically on load.
 */
export default function App() {
  const { state, track } = useTracking();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Shared tracking links: ?track=LIN123456789
  useEffect(() => {
    const number = new URLSearchParams(window.location.search).get("track");
    if (number) track(number);
  }, [track]);

  // Bring the results into view when a lookup succeeds.
  useEffect(() => {
    if (state.status === "success") {
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [state.status]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero
          onTrack={track}
          trackingLoading={state.status === "loading"}
          trackingError={state.status === "error" ? state.message : undefined}
        />

        {state.status === "loading" && (
          <section aria-label="Loading tracking results" className="relative overflow-hidden pb-10">
            <SciFiBackdrop intensity="soft" />
            <div className="shell relative">
              <LoadingSkeleton />
            </div>
          </section>
        )}

        {state.status === "success" && (
          <section
            ref={resultsRef}
            aria-label="Tracking results"
            className="relative scroll-mt-24 overflow-hidden pb-10"
          >
            <SciFiBackdrop intensity="soft" />
            <div className="shell relative">
              <TrackingDashboard data={state.data} />
            </div>
          </section>
        )}

        <WhyChooseUsSection />

        <ServicesSection />

        <ReviewsSection />

      </main>
      <Footer />
    </div>
  );
}
