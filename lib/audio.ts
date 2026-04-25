// F1.9 — Web Audio dB sampling (client-only).
// Privacy: raw audio never leaves the device. Only the computed dB number is uploaded.

export type DbSample = { db: number; at: number };

export async function startDbCapture(
  durationMs: number,
  onTick: (s: DbSample) => void,
): Promise<{ avgDb: number; stop: () => void }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const buf = new Uint8Array(analyser.fftSize);
  const samples: number[] = [];
  let stopped = false;
  const start = performance.now();

  return new Promise((resolve) => {
    function loop() {
      if (stopped) return;
      analyser.getByteTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      const db = 20 * Math.log10(Math.max(rms, 1e-6)) + 94; // approx SPL offset
      samples.push(db);
      onTick({ db, at: performance.now() - start });
      if (performance.now() - start >= durationMs) {
        stopped = true;
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();
        const avgDb = samples.reduce((a, b) => a + b, 0) / samples.length;
        resolve({ avgDb, stop: () => {} });
        return;
      }
      requestAnimationFrame(loop);
    }
    loop();
  }).then((r) => r as { avgDb: number; stop: () => void });
}
