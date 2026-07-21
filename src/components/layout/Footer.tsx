/**
 * Minimal closing footer: hairline top border, centered two-line signature,
 * gradient divider dot detail — clean, short, consistent with the site.
 */
export function Footer() {
  return (
    <footer className="relative border-t border-canvas-line bg-white py-7 sm:py-8">
      <div className="shell text-center">
        <div className="mx-auto mb-3 flex items-center justify-center" aria-hidden="true">
          <span className="h-1 w-1 rounded-full bg-[#2D8CFF]" />
          <span className="h-px w-10 bg-gradient-to-r from-[#2D8CFF] to-[#6C2EFF]" />
          <span className="h-1 w-1 rounded-full bg-[#6C2EFF]" />
        </div>
        <p className="text-xs font-bold tracking-wide text-ink sm:text-[12.5px]">
          A Trusted Legal &amp; Discreet Logistics Company
        </p>
        <p className="mt-1 text-[10.5px] text-ink-soft">Linus Delivery Company © 2026</p>
      </div>
    </footer>
  );
}
