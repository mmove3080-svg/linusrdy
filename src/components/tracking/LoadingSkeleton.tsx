/** Skeleton shown while a tracking lookup is in flight. */
export function LoadingSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-6 border-b border-canvas-line px-6 py-5">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-canvas-tint" />
        {[36, 24, 28].map((w, i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 w-16 animate-pulse rounded bg-canvas-tint" />
            <div className={`h-3.5 animate-pulse rounded bg-canvas-tint`} style={{ width: w * 4 }} />
          </div>
        ))}
        <div className="ml-auto h-8 w-24 animate-pulse rounded-xl bg-canvas-tint" />
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(240px,30%)_1fr]">
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-6 w-6 animate-pulse rounded-full bg-canvas-tint" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-canvas-tint" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-canvas-tint" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-[320px] animate-pulse rounded-2xl bg-canvas-tint" />
      </div>
    </div>
  );
}
