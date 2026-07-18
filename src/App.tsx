import { useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { TrackingDashboard } from "@/components/tracking/TrackingDashboard";
import { LoadingSkeleton } from "@/components/tracking/LoadingSkeleton";
import { SECTION_IDS } from "@/lib/constants";
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
          <section aria-label="Loading tracking results" className="shell pb-10">
            <LoadingSkeleton />
          </section>
        )}

        {state.status === "success" && (
          <section
            ref={resultsRef}
            aria-label="Tracking results"
            className="shell scroll-mt-24 pb-10"
          >
            <TrackingDashboard data={state.data} />
          </section>
        )}

        <FeatureStrip />

        {/* Later sections */}
        <section id={SECTION_IDS.whatWeDo} aria-label="What we do" className="scroll-mt-28" />
        <section id={SECTION_IDS.whyChooseUs} aria-label="Why choose us" className="scroll-mt-28" />
        <section id={SECTION_IDS.reviews} aria-label="Customer reviews" className="scroll-mt-28" />
      </main>
    </div>
  );
}
