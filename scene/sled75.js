// SLED75 with the rev H front loader and the JD 30 in rototiller (v3.8, raised 150 mm), from SpaceDIRT's own CAD.
// Mesh source: sled75_cad.bin, a decimated export of SpaceDIRT's SLED75, loader and tiller CAD. NOT included in the public
// repo. Without it, buildSled() falls back to placeholderSled() below: simple shapes at the vehicle's overall dimensions.
// Meshes are decimated for the film. Vehicle frame: z forward (loader end), y up from the tyre contact, origin mid-wheelbase.
// Loader kinematics follow the simulator README: arm about P, bucket about Q, PA-13 bodies aimed at their pins.
// Also here: a plain crew figure in shirtsleeves with walk, duck and work poses.
import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import CAD from './sled75_cad.bin';

const deg = Math.PI / 180;
export const LOADER_POSES = {           // rev H named poses, manifest.json; park is the bucket lifted level just off the deck
  dig: { a: 0, b: 0 }, carry: { a: 13, b: 18 }, park: { a: 3.5, b: -3.5 },
};

function readCAD() {
  const u8 = CAD, dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const hl = dv.getUint32(4, true), head = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + hl))), base = 8 + hl;
  const geos = {};
  for (const m of head.meshes) {
    const pb = u8.slice(base + m.op, base + m.op + m.nv * 6), q = new Uint16Array(pb.buffer), p = new Float32Array(m.nv * 3);
    for (let k = 0; k < p.length; k++) p[k] = m.min[k % 3] + q[k] / 65535 * m.size[k % 3];
    const ib = u8.slice(base + m.oi, base + m.oi + m.ni * (m.i32 ? 4 : 2)), idx = m.i32 ? new Uint32Array(ib.buffer) : new Uint16Array(ib.buffer);
    let g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
    g = toCreasedNormals(g, 35 * deg);
    (geos[m.name] = geos[m.name] || []).push({ mat: m.mat, g });
  }
  return { head, geos };
}

export function buildSled() {
  if (!CAD || CAD.byteLength < 8) return placeholderSled();
  const { head, geos } = readCAD();
  const M = {
    rover: new THREE.MeshStandardMaterial({ color: 0xc6cad0, roughness: 0.5, metalness: 0.35 }),
    loader_steel: new THREE.MeshStandardMaterial({ color: 0x7a7f85, roughness: 0.5, metalness: 0.4 }),
    pin: new THREE.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.35, metalness: 0.6 }),
    actuator: new THREE.MeshStandardMaterial({ color: 0x26282c, roughness: 0.5, metalness: 0.3 }),
    rod: new THREE.MeshStandardMaterial({ color: 0xdee1e5, roughness: 0.15, metalness: 0.9 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: 0.92, metalness: 0 }),
    wheel_steel: new THREE.MeshStandardMaterial({ color: 0xdcdcd6, roughness: 0.45, metalness: 0.25 }),   // the real rims are white
    hood: new THREE.MeshStandardMaterial({ color: 0x8e8d86, roughness: 0.55, metalness: 0.2, side: THREE.DoubleSide }),
    rotor: new THREE.MeshStandardMaterial({ color: 0x45464a, roughness: 0.5, metalness: 0.45 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2b2c30, roughness: 0.55, metalness: 0.3 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x6f7378, roughness: 0.5, metalness: 0.4 }),
  };
  const part = name => { const g = new THREE.Group(); for (const q of geos[name]) { const m = new THREE.Mesh(q.g, M[q.mat] || M.rover); m.castShadow = true; m.receiveShadow = true; g.add(m); } return g; };
  const V = new THREE.Vector3, P = head.pivots, pins = head.pins;
  const root = new THREE.Group(); root.rotation.order = 'YXZ';
  const body = part('body'); root.add(body); root.add(part('tiller'));
  const wheels = [];
  for (const [k, side] of [['wheelFL', 'L'], ['wheelFR', 'R'], ['wheelRL', 'L'], ['wheelRR', 'R']]) {
    const w = part('wheel' + side), g = new THREE.Group(); g.position.set(...P[k]); g.add(w); root.add(g); wheels.push(g);
  }
  // Loader. Each part's mesh is stored relative to its own pivot.
  const arm = new THREE.Group(); arm.position.set(...P.arm); arm.add(part('arm')); root.add(arm);
  const bucket = new THREE.Group(); bucket.position.set(P.bucket[0] - P.arm[0], P.bucket[1] - P.arm[1], P.bucket[2] - P.arm[2]); bucket.add(part('bucket')); arm.add(bucket);
  const act = (bodyName, rodName, at, parent, rel) => {
    const b = new THREE.Group(), r = new THREE.Group(), rm = part(rodName);
    b.position.set(at[0] - rel[0], at[1] - rel[1], at[2] - rel[2]); r.position.copy(b.position); b.add(part(bodyName)); r.add(rm); parent.add(b); parent.add(r);
    return { b, r, rm };
  };
  const liftL = act('liftBodyL', 'liftRodL', P.liftL, root, [0, 0, 0]), liftR = act('liftBodyR', 'liftRodR', P.liftR, root, [0, 0, 0]);
  const tilt = act('tiltBody', 'tiltRod', P.tilt, arm, P.arm);
  // Rotation about +x by th turns the (z, y) angle by -th, so a raise of a is rotation.x = -a.
  const rotYZ = (p, c, th) => { const dy = p[1] - c[1], dz = p[2] - c[2], co = Math.cos(th), si = Math.sin(th); return [p[0], c[1] + dy * co - dz * si, c[2] + dy * si + dz * co]; };
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[2] - a[2]), len = (a, b) => Math.hypot(b[1] - a[1], b[2] - a[2]);
  function pose(a, b) {                 // degrees: arm raise, bucket roll-back relative to the arm
    const A = a * deg, B = b * deg;
    arm.rotation.x = -A; bucket.rotation.x = -B;
    for (const [L, pin] of [[liftL, pins.liftA_L], [liftR, pins.liftA_R]]) {
      const Bp = L === liftL ? P.liftL : P.liftR, A1 = rotYZ(pin, P.arm, -A), d = ang(Bp, pin) - ang(Bp, A1);
      L.b.rotation.x = d; L.r.rotation.x = d;
      const ax = new THREE.Vector3(0, pin[1] - Bp[1], pin[2] - Bp[2]).normalize(); L.rm.position.copy(ax.multiplyScalar(len(Bp, A1) - len(Bp, pin)));
    }
    { const lug1 = rotYZ(pins.lug, P.bucket, -B), d = ang(P.tilt, pins.lug) - ang(P.tilt, lug1);    // in the arm's own frame
      tilt.b.rotation.x = d; tilt.r.rotation.x = d;
      const ax = new THREE.Vector3(0, pins.lug[1] - P.tilt[1], pins.lug[2] - P.tilt[2]).normalize(); tilt.rm.position.copy(ax.multiplyScalar(len(P.tilt, lug1) - len(P.tilt, pins.lug))); }
  }
  pose(LOADER_POSES.carry.a, LOADER_POSES.carry.b);
  const R = head.wheelRadius, half = (P.wheelFL[2] - P.wheelRL[2]) / 2;
  // Bucket cutting edge in the park pose, vehicle frame (for the nose stop)
  const edgeDig = [0, 0.5903 - 0.614614, 1.6756 - (0.296254 + 0.91486) / 2];
  const edgeAt = (a, b) => { const q = rotYZ(rotYZ(edgeDig, P.bucket, -b * deg), P.arm, -a * deg); return q; };
  return { root, pose, wheels, R, half, track: Math.abs(P.wheelFL[0] - P.wheelFR[0]), edgeAt, M, setSpin: th => wheels.forEach(w => { w.rotation.x = th; }) };
}

// Placeholder SLED75 for builds without the CAD mesh. Same interface as the CAD version. Overall size from the CAD:
// footprint 1.20 x 1.00 m, tyre 0.521 m, wheelbase 0.619 m, track 0.745 m, top 1.14 m, loader ahead, tiller behind.
function placeholderSled() {
  const mat = (c, r = 0.55, m = 0.3) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const M = { rover: mat(0xc6cad0, 0.5, 0.35), steel: mat(0x7a7f85, 0.5, 0.4), rubber: mat(0x1d1d1f, 0.92, 0), rim: mat(0xdcdcd6, 0.45, 0.25), dark: mat(0x2b2c30) };
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; return b; };
  const R = 0.2605, half = 0.3095, track = 0.745;
  const root = new THREE.Group(); root.rotation.order = 'YXZ';
  root.add(box(0.50, 0.34, 1.20, M.rover, 0, 0.40, 0)); root.add(box(0.604, 0.03, 1.0, M.rover, 0, 0.585, 0));
  for (const x of [-0.375, 0.375]) root.add(box(0.25, 0.03, 0.80, M.rover, x, 0.60, 0));
  for (const x of [-0.30, 0.30]) root.add(box(0.06, 0.52, 0.06, M.steel, x, 0.86, -0.42));
  root.add(box(0.66, 0.06, 0.06, M.steel, 0, 1.11, -0.42));
  root.add(box(0.75, 0.40, 0.50, M.dark, 0, 0.33, -1.05));
  const wheels = [];
  for (const x of [-track / 2, track / 2]) for (const z of [half, -half]) {
    const g = new THREE.Group(); g.position.set(x, R, z);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.2, 32), M.rubber); t.rotation.z = Math.PI / 2; t.castShadow = true; g.add(t);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.55, R * 0.55, 0.21, 24), M.rim); h.rotation.z = Math.PI / 2; g.add(h);
    root.add(g); wheels.push(g);
  }
  const pivot = [0, 0.55, 0.15], arm = new THREE.Group(); arm.position.set(...pivot); root.add(arm);
  for (const x of [-0.42, 0.42]) { const a = box(0.05, 0.05, 0.85, M.steel, x, -0.14, 0.40); a.rotation.x = 0.33; arm.add(a); }
  const bucket = new THREE.Group(); bucket.position.set(0, -0.40, 0.80); arm.add(bucket); bucket.add(box(1.067, 0.30, 0.30, M.steel, 0, 0, 0.12));
  const pose = (a, b) => { arm.rotation.x = -a * deg; bucket.rotation.x = -b * deg; };
  pose(LOADER_POSES.carry.a, LOADER_POSES.carry.b);
  const rotYZ = (p, c, th) => { const dy = p[1] - c[1], dz = p[2] - c[2], co = Math.cos(th), si = Math.sin(th); return [p[0], c[1] + dy * co - dz * si, c[2] + dy * si + dz * co]; };
  const edgeDig = [0, -0.0243, 1.0701], edgeAt = (a) => rotYZ(edgeDig, pivot, -a * deg);
  return { root, pose, wheels, R, half, track, edgeAt, M, setSpin: th => wheels.forEach(w => { w.rotation.x = th; }) };
}

// Crew figure, 1.70 m, shirtsleeves. Faces +z. Joints: hips, knees, shoulders, elbows, spine, neck.
export function buildPerson(clip = []) {
  const m = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, clippingPlanes: clip });
  const shirt = m(0xd9d8d1), trousers = m(0x47484c), skin = m(0xb3a596, 0.7), shoe = m(0x26272a, 0.6), hair = m(0x35322f);
  const mk = (g, mt) => { const x = new THREE.Mesh(g, mt); x.castShadow = true; x.receiveShadow = true; return x; };
  const cap = (r, l, mt) => mk(new THREE.CapsuleGeometry(r, l, 6, 14), mt);
  const root = new THREE.Group(), pelvis = new THREE.Group(); pelvis.position.y = 0.90; root.add(pelvis);
  const hip = mk(new THREE.SphereGeometry(0.15, 20, 12), trousers); hip.scale.set(1, 0.62, 0.72); pelvis.add(hip);
  const spine = new THREE.Group(); spine.position.y = 0.04; pelvis.add(spine);
  const torsoG = new THREE.LatheGeometry([[0.001, 0], [0.14, 0.0], [0.135, 0.12], [0.155, 0.28], [0.175, 0.42], [0.17, 0.5], [0.08, 0.56], [0.001, 0.565]].map(p => new THREE.Vector2(p[0], p[1])), 28);
  const torso = mk(torsoG, shirt); torso.scale.z = 0.62; spine.add(torso);
  const neck = new THREE.Group(); neck.position.y = 0.55; spine.add(neck);
  neck.add(mk(new THREE.CylinderGeometry(0.048, 0.052, 0.09, 14), skin).translateY(0.04));
  const head = mk(new THREE.SphereGeometry(0.1, 24, 16), skin); head.scale.set(0.9, 1.12, 1.0); head.position.set(0, 0.16, 0.01); neck.add(head);
  const hr = mk(new THREE.SphereGeometry(0.104, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hair); hr.scale.set(0.92, 1.1, 1.02); hr.position.set(0, 0.175, -0.005); hr.rotation.x = -0.25; neck.add(hr);
  const limb = (parent, x, y, r1, l1, r2, l2, m1, m2, foot) => {
    const j1 = new THREE.Group(); j1.position.set(x, y, 0); parent.add(j1);
    j1.add(cap(r1, l1, m1).translateY(-l1 / 2 - r1 * 0.3));
    const j2 = new THREE.Group(); j2.position.y = -l1 - r1 * 0.3; j1.add(j2);
    j2.add(cap(r2, l2, m2).translateY(-l2 / 2 - r2 * 0.4));
    if (foot) { const f = mk(new THREE.BoxGeometry(0.1, 0.07, 0.25), shoe); f.position.set(0, -l2 - 0.06, 0.05); j2.add(f); }
    else { const h = mk(new THREE.SphereGeometry(0.045, 14, 10), skin); h.scale.set(0.8, 1.2, 0.6); h.position.y = -l2 - 0.07; j2.add(h); }
    return { j1, j2 };
  };
  const legL = limb(pelvis, 0.09, -0.02, 0.07, 0.36, 0.055, 0.36, trousers, trousers, true), legR = limb(pelvis, -0.09, -0.02, 0.07, 0.36, 0.055, 0.36, trousers, trousers, true);
  const armL = limb(spine, 0.2, 0.48, 0.05, 0.25, 0.043, 0.22, shirt, skin, false), armR = limb(spine, -0.2, 0.48, 0.05, 0.25, 0.043, 0.22, shirt, skin, false);
  // pose: { walk: 0..1 amount, phase: rad, duck: 0..1, work: 0..1 }
  function set(q) {
    const w = q.walk || 0, ph = q.phase || 0, s = Math.sin(ph), wk = q.work || 0, dk = q.duck || 0;
    legL.j1.rotation.x = -0.45 * w * s - 0.25 * wk; legR.j1.rotation.x = 0.45 * w * s - 0.25 * wk;
    legL.j2.rotation.x = 0.6 * w * Math.max(0, Math.sin(ph + 1.2)) + 0.3 * wk; legR.j2.rotation.x = 0.6 * w * Math.max(0, -Math.sin(ph + 1.2)) + 0.3 * wk;
    armL.j1.rotation.x = 0.35 * w * s - 0.95 * wk; armR.j1.rotation.x = -0.35 * w * s - 1.05 * wk;
    armL.j1.rotation.z = 0.08; armR.j1.rotation.z = -0.08;
    armL.j2.rotation.x = -0.25 * w - 0.75 * wk; armR.j2.rotation.x = -0.25 * w - 0.6 * wk;
    spine.rotation.x = 0.55 * dk + 0.5 * wk; neck.rotation.x = -0.2 * dk + 0.3 * wk;
    pelvis.position.y = 0.90 - 0.03 * w * Math.abs(Math.cos(ph)) - 0.07 * wk - 0.03 * dk;
  }
  set({});
  return { root, set };
}
