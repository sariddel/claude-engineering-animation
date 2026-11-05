// Renders the G-3 sequence frame by frame and encodes it in the browser, so the result does not depend
// on render speed. H.264 MP4 if the browser offers it, otherwise VP9 WebM. Same size, rate and codec as the G-1 film.
import * as THREE from 'three';
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4Target } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmTarget } from 'webm-muxer';
import { buildScene, loadAssets, drawOverlay, T_END } from './scene.js';

// Options from the page URL: ?w=1920&h=1080&fps=30&clean=1. clean = picture only (no captions, credits, labels or progress line).
// Defaults reproduce G3_sequence.mp4: 1280 x 720, 25 fps, with the overlay.
const Q = new URLSearchParams(location.search);
const W = +(Q.get('w') || 1280), H = +(Q.get('h') || 720), FPS = +(Q.get('fps') || 25), CLEAN = Q.get('clean') === '1';
(async () => {
  await loadAssets();
  const gl = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  gl.setSize(W, H); gl.setPixelRatio(1); gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFShadowMap;
  gl.localClippingEnabled = true; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0;
  const S = buildScene({ shadow: 2048 });
  S.camera.aspect = W / H; S.camera.updateProjectionMatrix();
  const out = document.createElement('canvas'); out.width = W; out.height = H; const ctx = out.getContext('2d');
  function drawFrame(t) { S.apply(t); gl.render(S.scene, S.camera); ctx.drawImage(gl.domElement, 0, 0); if (!CLEAN) drawOverlay(ctx, S, t, W, H); }
  window.renderFilm = async (tEnd = T_END, t0 = 0) => {
    const mp4 = await VideoEncoder.isConfigSupported({ codec: 'avc1.640028', width: W, height: H, bitrate: 3.5e6, framerate: FPS }).catch(() => ({ supported: false }));
    const useMp4 = mp4.supported, target = useMp4 ? new Mp4Target() : new WebmTarget();
    const mux = useMp4 ? new Mp4Muxer({ target, video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory' })
      : new WebmMuxer({ target, video: { codec: 'V_VP9', width: W, height: H, frameRate: FPS } });
    const enc = new VideoEncoder({ output: (c, m) => mux.addVideoChunk(c, m), error: e => { window.filmError = String(e); } });
    enc.configure({ codec: useMp4 ? 'avc1.640028' : 'vp09.00.40.08', width: W, height: H, bitrate: 3.5e6, framerate: FPS });
    const i0 = Math.round(t0 * FPS), n = Math.round(tEnd * FPS);
    for (let i = i0; i < n; i++) {
      drawFrame(i / FPS);
      const vf = new VideoFrame(out, { timestamp: Math.round((i - i0) * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
      enc.encode(vf, { keyFrame: (i - i0) % (FPS * 2) === 0 }); vf.close();
      while (enc.encodeQueueSize > 4) await new Promise(r => setTimeout(r, 5));
      if (i % 50 === 0) await window.progress(i, n);
    }
    await enc.flush(); mux.finalize();
    const bytes = new Uint8Array(target.buffer); let b = ''; const step = 0x8000;
    for (let i = 0; i < bytes.length; i += step) b += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    return { ext: useMp4 ? 'mp4' : 'webm', data: btoa(b), error: window.filmError || null };
  };
  // Single frames as images, for stills and for a resumable render (frames to files, then one encode pass)
  window.frameAt = (t, type = 'image/png', q = 0.95) => { drawFrame(t); return out.toDataURL(type, q); };
  window.ready = true;
})();
