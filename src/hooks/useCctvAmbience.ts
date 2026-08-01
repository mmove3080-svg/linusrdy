import { useEffect, useRef } from "react";

/**
 * Synthesized CCTV ambience — generated entirely with the Web Audio API, so
 * there are no audio files to download and nothing to keep in sync with the
 * video.
 *
 * Three layered elements, all quiet enough to sit under the video's own track:
 *   1. Electrical room tone — filtered brown noise, the low hum of a camera
 *      housing and vehicle cabin.
 *   2. Camera motor — a soft servo whir that sweeps periodically, as though
 *      the lens is adjusting focus.
 *   3. Security beacon — a short blip synchronised to the flashing red light,
 *      plus the faint tick of the recording indicator.
 *
 * Master output follows the device's own volume: there is no in-app volume
 * control, and the gain is fixed at a natural listening level.
 */
export function useCctvAmbience(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    let ctx: AudioContext;
    try {
      ctx = new AudioCtx();
    } catch {
      return; // audio unavailable on this device
    }
    ctxRef.current = ctx;

    // Master bus — fixed level; the device's own volume controls loudness.
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    // Fade in so it never starts abruptly.
    master.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 1.2);

    // ── 1. Electrical room tone (brown noise through a low-pass) ──
    const noiseLength = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < noiseLength; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02; // brown noise integration
      noiseData[i] = lastOut * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 420;
    noiseFilter.Q.value = 0.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.16;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start();

    // Mains hum riding on top of the room tone
    const hum = ctx.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 60;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.012;
    hum.connect(humGain).connect(master);
    hum.start();

    // ── 2. Camera motor — periodic servo whir ──
    const motor = ctx.createOscillator();
    motor.type = "sawtooth";
    motor.frequency.value = 88;
    const motorFilter = ctx.createBiquadFilter();
    motorFilter.type = "bandpass";
    motorFilter.frequency.value = 700;
    motorFilter.Q.value = 5;
    const motorGain = ctx.createGain();
    motorGain.gain.value = 0; // silent until a sweep fires
    motor.connect(motorFilter).connect(motorGain).connect(master);
    motor.start();

    const sweepMotor = () => {
      const t = ctx.currentTime;
      // gentle rise and fall, like a lens hunting focus
      motorGain.gain.cancelScheduledValues(t);
      motorGain.gain.setValueAtTime(0.0001, t);
      motorGain.gain.exponentialRampToValueAtTime(0.05, t + 0.28);
      motorGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      motor.frequency.cancelScheduledValues(t);
      motor.frequency.setValueAtTime(76, t);
      motor.frequency.linearRampToValueAtTime(104, t + 0.7);
      motor.frequency.linearRampToValueAtTime(80, t + 1.5);
    };
    const motorTimer = window.setInterval(sweepMotor, 9000);
    window.setTimeout(sweepMotor, 2500);

    // ── 3. Security beacon blip + recording tick ──
    const blip = (freq: number, duration: number, level: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    };

    // Red beacon pulse, matching the flashing light in the footage
    const beaconTimer = window.setInterval(() => blip(1180, 0.16, 0.05), 3400);
    // Quiet recording tick
    const recTimer = window.setInterval(() => blip(2400, 0.045, 0.018), 1000);

    stopRef.current = () => {
      window.clearInterval(motorTimer);
      window.clearInterval(beaconTimer);
      window.clearInterval(recTimer);
      const t = ctx.currentTime;
      try {
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      } catch {
        /* context may already be closing */
      }
      window.setTimeout(() => {
        try {
          noise.stop();
          hum.stop();
          motor.stop();
          void ctx.close();
        } catch {
          /* already stopped */
        }
      }, 420);
    };

    return () => {
      stopRef.current?.();
      stopRef.current = null;
      ctxRef.current = null;
    };
  }, [enabled]);
}
