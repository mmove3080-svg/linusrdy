import { useState } from "react";
import { Bell, Check } from "lucide-react";

type Stage = "idle" | "entering" | "confirmed";

/** Formats digits as +1 (555) 123-4567 while the user types. */
function formatUsPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `+1 (${digits}`;
  if (digits.length <= 6) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Valid US numbers have 10 digits and an area/exchange code not starting with 0 or 1. */
function isValidUsPhone(formatted: string): boolean {
  const digits = formatted.replace(/\D/g, "").replace(/^1/, "");
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);
}

/**
 * Real-time SMS updates card. Lives inside the Tracking Journey panel,
 * directly beneath the history toggle.
 */
export function AlertsCard() {
  const [stage, setStage] = useState<Stage>("idle");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = isValidUsPhone(phone);

  if (stage === "confirmed") {
    return (
      <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-soft">
            <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-emerald-800">Alerts enabled</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-emerald-700">
              You'll receive SMS notifications at {phone} whenever new updates become available
              for your package.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-violet-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-soft">
          <Bell className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold text-ink">Get real-time updates</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft">
            Turn on notifications and never miss an update.
          </p>

          {stage === "entering" && (
            <div className="mt-3">
              <label htmlFor="sms-phone" className="sr-only">
                US mobile number
              </label>
              <input
                id="sms-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(formatUsPhone(e.target.value))}
                onBlur={() => setTouched(true)}
                aria-invalid={touched && !valid}
                className={`w-full rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold text-ink outline-none transition-shadow placeholder:font-normal placeholder:text-ink-faint ${
                  touched && !valid && phone
                    ? "border-red-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-violet-200 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]"
                }`}
              />
              {touched && phone && !valid && (
                <p role="alert" className="mt-1.5 text-[11px] font-semibold text-red-600">
                  Enter a valid US mobile number.
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (stage === "idle") {
                setStage("entering");
                return;
              }
              setTouched(true);
              if (valid) setStage("confirmed");
            }}
            disabled={stage === "entering" && !valid}
            className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft transition-all duration-200 enabled:hover:bg-violet-700 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enable Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
