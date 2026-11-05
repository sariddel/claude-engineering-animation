// Encodes rendered JPEG frames into an H.264 MP4: 1280 x 720, 25 fps, avc1.640028 at 3.5 Mbit/s, keyframe every 2 s (as the G-1 film).
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
const W = 1280, H = 720, FPS = 25;
let enc, mux, target, i = 0;
window.start = async () => {
  const cfg = { codec: 'avc1.640028', width: W, height: H, bitrate: 3.5e6, framerate: FPS };
  const sup = await VideoEncoder.isConfigSupported(cfg).catch(() => ({ supported: false })); if (!sup.supported) return false;
  target = new ArrayBufferTarget(); mux = new Muxer({ target, video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory' });
  enc = new VideoEncoder({ output: (c, m) => mux.addVideoChunk(c, m), error: e => { window.err = String(e); } }); enc.configure(cfg); return true;
};
window.add = async b64 => {
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), bmp = await createImageBitmap(new Blob([bin], { type: 'image/jpeg' }));
  const vf = new VideoFrame(bmp, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
  enc.encode(vf, { keyFrame: i % (FPS * 2) === 0 }); vf.close(); bmp.close(); i++;
  while (enc.encodeQueueSize > 4) await new Promise(r => setTimeout(r, 5));
  return i;
};
window.finish = async () => {
  await enc.flush(); mux.finalize(); const bytes = new Uint8Array(target.buffer); let b = '';
  for (let k = 0; k < bytes.length; k += 0x8000) b += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
  return { data: btoa(b), err: window.err || null, frames: i };
};
window.ready = true;
