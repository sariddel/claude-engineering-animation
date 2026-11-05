// Interactive viewer: play the sequence, scrub the timeline, orbit freely when paused.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildScene, loadAssets, STEPS, T_END, drawLabels } from './scene.js';

(async () => {
  await loadAssets();
  const r = new THREE.WebGLRenderer({ antialias: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
  r.localClippingEnabled = true; r.toneMapping = THREE.ACESFilmicToneMapping;
  const $ = id => document.getElementById(id);
  $('v').appendChild(r.domElement);
  const over = document.createElement('canvas'); over.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'; $('v').appendChild(over); const octx = over.getContext('2d');
  const S = buildScene({ shadow: 2048 });
  const ctl = new OrbitControls(S.camera, r.domElement); ctl.enabled = false; ctl.target.set(0, 3, 3);
  const slider = $('t'), btn = $('play'), lab = $('lab'), list = $('steps');
  slider.max = T_END;
  STEPS.forEach((q, i) => { const b = document.createElement('button'); b.textContent = `${i + 1}. ${q.label}`; b.onclick = () => { go(q.t0 + 0.01); setPlay(true); }; list.appendChild(b); q.el = b; });
  let t = 0, play = true, last = performance.now(), orbit = false;
  function setPlay(p) { play = p; btn.textContent = play ? 'Pause' : 'Play'; if (play) { orbit = false; ctl.enabled = false; $('orbit').classList.remove('on'); } }
  function go(x) { t = Math.max(0, Math.min(T_END, x)); slider.value = t; }
  btn.onclick = () => setPlay(!play);
  slider.oninput = () => { go(+slider.value); setPlay(false); };
  $('orbit').onclick = () => { orbit = !orbit; setPlay(false); ctl.enabled = orbit; $('orbit').classList.toggle('on', orbit); if (orbit) { ctl.target.set(0, 3, 3); ctl.update(); } };
  function size() { const e = $('v'), w = e.clientWidth, h = e.clientHeight; r.setSize(w, h); S.camera.aspect = w / h; S.camera.updateProjectionMatrix(); }
  addEventListener('resize', size); size();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (play) { go(t + dt); if (t >= T_END) setPlay(false); }
    const keep = orbit ? { p: S.camera.position.clone(), q: S.camera.quaternion.clone() } : null;
    S.apply(t);
    if (keep) { S.camera.position.copy(keep.p); S.camera.quaternion.copy(keep.q); ctl.update(); }
    S.camera.aspect = r.domElement.clientWidth / r.domElement.clientHeight; S.camera.updateProjectionMatrix();
    r.render(S.scene, S.camera);
    const e = $('v'), w = e.clientWidth, h = e.clientHeight; if (over.width !== w || over.height !== h) { over.width = w; over.height = h; }
    octx.clearRect(0, 0, w, h); if (!orbit) drawLabels(octx, S.labels(t, w, h), w, h, 1);
    const q = STEPS.find(x => t >= x.t0 && t < x.t1) || STEPS[STEPS.length - 1];
    lab.textContent = q.label; STEPS.forEach(x => x.el.classList.toggle('on', x === q));
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
