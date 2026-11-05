// Project 144, G-3 garage. Parametric 3D scene for the door, ramp, dust and crew sequence.
// Geometry: designG-3G-3_geometry.json, read at build time. Shaun set the 4.2 m vessel, the widest door, the SLED75 class and
// (2026-11-05) an end door that is one solid curved leaf which moves in, lifts and slides up into the roof on tracks, so the floor
// stays free. Everything else in G-3 is a proposal by Claude.
// Drawn here beyond the json (proposals, see the hand-back): leaf ribs, roller carriages, track brackets and door drive, latch
// units, lip hinge at the sill, the ramp tracks as slat chains in channels under the deck plate with an S-guide and mouth covers
// (the coordinator's option (d), not designed), hopper and pipe shapes, shower portal, camera path and timing.
// Axes: x across, y up, z along the bore. Seal plane z = 0, +z into the bay toward the node, ground y = 0.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import GEO from '../design/G-3_geometry.json';
import AZONIX from 'azonix-font';
import { buildSled, buildPerson, LOADER_POSES } from './sled75.js';

// ---------------------------------------------------------------- geometry, all from the json
const V = GEO.vessel, DK = GEO.deck, DR = GEO.door, MO = DR.motion, LK = GEO.dustLock, RP = GEO.rearPort, BM = GEO.berm, RA = GEO.ramp, VE = GEO.vehicle;
const EQ = Object.fromEntries(GEO.equipment.map(e => [e.key, e]));
export const G = {
  Ri: V.ID / 2, Ro: V.OD / 2, ax: V.axisY, zFace: V.frontFaceZ, zBulk: V.frontBulkhead.z, zTan: V.rearTangentZ, zCrown: V.rearCrownZ,
  domeR: V.rearDome.crownRadius, domeC: V.rearDome.centreZ,
  deckY: DK.y, deckHalf: DK.width / 2, deckZ0: DK.zFrom, plenumY: DK.plenumFloorY,
  oW: DR.opening.W, oH: DR.opening.H, fW: DR.frame.W, fH: DR.frame.H, fZ0: DR.frame.zFrom, fZ1: DR.frame.zTo,
  lW: DR.leaf.W, lH: DR.leaf.H, lT: DR.leaf.thickness, seal: [DR.seals.innerLineOffset, DR.seals.outerLineOffset],
  inMove: MO.inMove, lift: MO.lift, pitch: DR.rollers.pitch, rollerX: DR.rollers.axleX[1], trackXc: DR.tracks.centreX[1],
  arcIn: DR.leaf.curvature.innerArcUW, arcOut: DR.leaf.curvature.outerArcUW, arcR: DR.leaf.curvature.radius, arcC: DR.leaf.curvature.centreUW,
  closed: MO.poses.closed, parked: MO.poses.parked, trackPts: DR.tracks.centrelineYZ, channel: DR.tracks.channel,
  trough: DR.sillTrough, lip: DR.bridgeLip,
  bulkApex: LK.bulkhead.apexZ, bulkR: LK.bulkhead.crownRadius, lockZ1: LK.floor.zTo, hatchA: LK.hatchA, hatchSill: LK.hatchA.sillY,
  port: RP, legs: GEO.legs, nose: GEO.stops.noseStopZ,
};
G.lipT = 0.04;                                   // json: "about 40 mm thick"
G.bulkC = G.bulkApex + G.bulkR;                  // centre of the dished bulkhead sphere
G.zNode = RP.nodeArm.faceZ + 2.1;                // node centre to arm face, as G-1's node
const zBulkAt = (x, y) => G.bulkC - Math.sqrt(G.bulkR ** 2 - x * x - (y - G.ax) ** 2);
const zDomeAt = (x, y) => G.domeC + Math.sqrt(G.domeR ** 2 - x * x - (y - G.ax) ** 2);
const halfChord = y => Math.sqrt(Math.max(0, G.Ri ** 2 - (y - G.ax) ** 2));
// Ramp tracks (coordinator's option (d), json ramp.stowed / sGuide / guideCovers / articulated; drawn by Claude, not designed):
// two chains of 9 plain slats in grated channels under the deck plate. They run up the S-guide behind the trough, out over the
// lip, lock straight and tilt onto the berm as in the json (4.8 m, tail at the frame face, 10.2 deg). Added here: a short
// down-turn at the rear end of each channel, so the stowed lead segment stays below the closed guide cover, and a cover that
// opens only over the front of the guide (z 0.45 to 0.88), where the chain crosses the deck plane.
// OPEN ITEM for the sizing: the 4.8 m chain plus a closed guide cover needs about 0.54 m more stowage than the json channel
// (z 1.24 to 5.36) gives; the down-turn at the rear end of each channel is a placeholder for that.
const trackX = RA.trackSpacingCentres / 2, trackT = 0.14, tipA = RA.deployedAngleDeg * Math.PI / 180;
const CH = { yb: RA.stowed.channels[1].y[0], zS1: RA.sGuide.zBottom, zS0: RA.sGuide.zTop, zMouth: 0.88, ybOut: RA.sGuide.pathOfTrackUndersideYZ.at(-1)[0],
  zChEnd: RA.stowed.channels[1].z[1], rC: 0.3, yDrop0: 1.30, zOut: -6.4 };
const chain = (() => {      // underside line of the slats in the y-z plane: rear down-turn, channel, S-guide, out past the frame
  const p = []; for (let y = CH.yDrop0; y < CH.yb - CH.rC - 1e-6; y += 0.05) p.push([y, CH.zChEnd]);
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 * i / 12; p.push([CH.yb - CH.rC + CH.rC * Math.sin(a), CH.zChEnd - CH.rC + CH.rC * Math.cos(a)]); }
  for (let z = CH.zChEnd - CH.rC - 0.1; z > CH.zS1 + 1e-6; z -= 0.1) p.push([CH.yb, z]);
  for (const q of RA.sGuide.pathOfTrackUndersideYZ) p.push([q[0], q[1]]);
  for (let z = CH.zS0 - 0.1; z > CH.zOut; z -= 0.1) p.push([CH.ybOut, z]);
  const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  const iTop = p.findIndex((q, i) => i > 0 && q[1] === CH.zS0 && q[0] === CH.ybOut), sGuideTop = L[iTop];
  const sOut = z => sGuideTop + (CH.zS0 - z);                 // on the run out past the frame
  let iLead = iTop; while (iLead > 0 && p[iLead][0] > 2.015) iLead--;          // stowed lead: its top stays under the deck plate
  const sLeadIn = L[iLead];
  return { p, L, len: L[L.length - 1], sGuideTop, sTailOut: sOut(RA.head.z), sTailIn: sLeadIn - RA.trackLength };
})();
function polyAt(P, L, s) { s = Math.max(0, Math.min(L[L.length - 1], s)); let k = 1; while (k < L.length - 1 && L[k] < s) k++; const f = (s - L[k - 1]) / Math.max(1e-9, L[k] - L[k - 1]); return [P[k - 1][0] + (P[k][0] - P[k - 1][0]) * f, P[k - 1][1] + (P[k][1] - P[k - 1][1]) * f]; }
// Berm surface along the lane and across
const bermTopZ0 = BM.top.zFrom, bermTopZ1 = BM.top.zTo, bermToe = BM.toeZ, bermNearToe = BM.nearFace.toeZ;
function bermY(x, z) {
  const along = z < bermTopZ0 ? BM.height * (z - bermToe) / (bermTopZ0 - bermToe) : z <= bermTopZ1 ? BM.height : BM.height * (bermNearToe - z) / (bermNearToe - bermTopZ1);
  return Math.max(0, Math.min(along, BM.height, (BM.top.width / 2 + BM.sideSlopeHV * BM.height - Math.abs(x)) / BM.sideSlopeHV));
}

// ---------------------------------------------------------------- livery: mark and wordmark are separate, swappable pieces
// Wordmark font switch. Azonix by Mixo matches Shaun's logo lettering (DaFont: free for personal use; commercial licence pending).
// To fall back, set WORDMARK = WORDMARKS.bahnschrift.
const WORDMARKS = {
  azonix: { text: 'SPACEDIRT', family: 'Azonix', weight: '400' },
  bahnschrift: { text: 'SpaceDIRT', family: 'Bahnschrift, "D-DIN", "Segoe UI", Arial, sans-serif', weight: '600' },
};
export const WORDMARK = (AZONIX && AZONIX.byteLength > 0) ? WORDMARKS.azonix : WORDMARKS.bahnschrift;   // Azonix only if fonts/Azonix.otf is supplied (see README)
const INK = '#17181a';
// Three-star mark, from the website SVG recreation (sd-logo.svg). Draws with its top-left at (x, y), height h.
export function drawMark(c, x, y, h) {
  const s = h / 76; c.save(); c.translate(x, y); c.scale(s, s); c.translate(-2, -14); c.fillStyle = INK;
  c.fill(new Path2D('M64 18 L67.5 26.5 L84 30 L67.5 33.5 L64 42 L60.5 33.5 L44 30 L60.5 26.5 Z M64 28 L67 30 L64 32 L61 30 Z M26 40 L29.5 48.5 L46 52 L29.5 55.5 L26 64 L22.5 55.5 L6 52 L22.5 48.5 Z M26 50 L29 52 L26 54 L23 52 Z M56 62 L59.5 70.5 L76 74 L59.5 77.5 L56 86 L52.5 77.5 L36 74 L52.5 70.5 Z M56 72 L59 74 L56 76 L53 74 Z'), 'evenodd');
  c.restore(); return 86 * s;                    // drawn width
}
// Wordmark, left-aligned at x, vertically centred on yMid, fitted to maxW and to a cap height of capH.
export function drawWordmark(c, x, yMid, maxW, capH) {
  c.font = `${WORDMARK.weight} 100px ${WORDMARK.family}`; const m = c.measureText(WORDMARK.text);
  const cap100 = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 72, fz = Math.min(100 * capH / cap100, 100 * maxW / m.width);
  c.font = `${WORDMARK.weight} ${fz.toFixed(1)}px ${WORDMARK.family}`; c.fillStyle = INK; c.textBaseline = 'alphabetic';
  const mm = c.measureText(WORDMARK.text); c.fillText(WORDMARK.text, x, yMid + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2);
  return mm.width;
}
function liveryCanvas() {
  const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 512; const c = cv.getContext('2d');
  const mw = drawMark(c, 24, 66, 380); drawWordmark(c, 24 + mw + 70, 256, 2048 - (24 + mw + 70) - 30, 170);
  return cv;
}
export async function loadAssets() {
  if (WORDMARK.family === 'Azonix') {
    const f = new FontFace('Azonix', AZONIX.buffer.slice(AZONIX.byteOffset, AZONIX.byteOffset + AZONIX.byteLength));
    await f.load(); document.fonts.add(f);
  }
  await document.fonts.ready;
}

// ---------------------------------------------------------------- timeline (film seconds)
const smooth = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const lerp = (a, b, s) => a + (b - a) * s;
const win = (a, b, c, d, t) => smooth(a, b, t) * (1 - smooth(c, d, t));
export const STEPS = [
  { t0: 0, t1: 6, label: 'G-3 garage on a Moon Base node' },
  { t0: 6, t1: 11, label: 'Bay pumped down, about 3.6 h. Air goes down through the floor' },
  { t0: 11, t1: 13, label: 'Latches release' },
  { t0: 13, t1: 20, label: 'Door moves in, lifts, slides up to the roof' },
  { t0: 20, t1: 22, label: 'Bridge lip folds down over the sill trough' },
  { t0: 22, t1: 28, label: 'Ramp tracks run out from under the deck and lock straight' },
  { t0: 28, t1: 42, label: 'SLED75 backs up the ramp. Regolith falls through the grate' },
  { t0: 42, t1: 45.5, label: 'Ramp tracks slide back under the deck' },
  { t0: 45.5, t1: 47, label: 'Bridge lip folds up' },
  { t0: 47, t1: 53.6, label: 'Door slides down, lowers and seats. Latches close' },
  { t0: 53.6, t1: 57, label: 'Bay fills from the tanks. Pressure holds the door shut' },
  { t0: 57, t1: 65, label: 'Downdraft through the floor carries dust to the hopper' },
  { t0: 65, t1: 74.3, label: 'Crew come in from the habitat. Hatch sealed behind them' },
  { t0: 74.3, t1: 76.9, label: 'Blow-down shower in the dust lock' },
  { t0: 76.9, t1: 79.8, label: 'Hatch to the shop' },
  { t0: 79.8, t1: 84.4, label: 'Shirtsleeve work on SLED75' },
  { t0: 84.4, t1: 89, label: 'G-3 closed, SLED75 inside' },
];
export const T_END = 89;
const DRIVE = { t0: 28.3, t1: 40.8, z0: -21 };

export function stateAt(t) {
  return {
    latch: win(11.3, 12.8, 52.9, 53.6, t),                 // 1 = released
    inMove: win(13.0, 13.8, 52.2, 52.8, t), lift: win(14.0, 14.8, 51.5, 52.1, t), slide: win(15.0, 19.6, 47.2, 51.4, t),
    lip: win(20.2, 21.6, 45.6, 46.8, t),                   // 1 = down over the trough
    mouth: win(22.0, 22.3, 25.6, 25.9, t) + win(43.0, 43.3, 45.0, 45.3, t), tSlide: win(22.3, 25.6, 43.3, 45.0, t), tTip: win(25.9, 27.6, 42.1, 43.0, t),
    drive: smooth(DRIVE.t0, DRIVE.t1, t), loaderPark: smooth(41.0, 42.0, t),
    cut: win(57.0, 58.6, 84.0, 85.5, t),                   // the only G-3 cutaway: inside reveal, then the crew walk
    cutM: win(64.6, 65.6, 74.4, 75.2, t),                  // habitat and node, for the crew walk only
    pump: 0, repress: 0, down: win(58.6, 59.2, 64.0, 64.8, t), shower: win(74.5, 75.0, 76.4, 76.9, t),
    hatchH: win(67.4, 68.4, 70.6, 71.2, t), hatchB: win(71.2, 72.0, 73.5, 74.3, t), hatchA: win(77.0, 77.8, 79.0, 79.8, t),
  };
}

// Camera keys: t, position, look-at, field of view. Outside from the start through the door closing.
const CAM = [
  { t: 0, p: [-46, 21, -40], c: [0, 3.0, 4], f: 34 },
  { t: 5.5, p: [-21, 8.5, -17], c: [0, 3.0, 2.5], f: 34 },
  { t: 10.5, p: [-6.8, 3.6, -9.4], c: [-0.2, 2.9, 0.4], f: 36 },
  { t: 12.8, p: [-2.4, 2.7, -5.2], c: [0, 3.3, 1.2], f: 40 },
  { t: 19.6, p: [-2.2, 2.65, -4.9], c: [0, 3.5, 1.4], f: 40 },
  { t: 21.6, p: [-3.4, 3.3, -5.0], c: [0, 2.3, 0.2], f: 38 },
  { t: 23.4, p: [-7.4, 4.0, -8.6], c: [0, 2.0, -1.8], f: 38 },
  { t: 27.6, p: [-9.5, 4.4, -10.5], c: [0, 1.8, -3.0], f: 38 },
  { t: 29.5, p: [-6.5, 2.6, -23.5], c: [0, 0.9, -18.0], f: 38 },
  { t: 33.5, p: [-6.6, 3.4, -16.5], c: [0, 1.6, -11.0], f: 38 },
  { t: 37.0, p: [-6.8, 3.9, -9.6], c: [0, 2.0, -4.6], f: 38 },
  { t: 40.8, p: [-4.4, 3.4, -6.4], c: [0, 2.6, 0.9], f: 38 },
  { t: 42.2, p: [-7.6, 3.8, -8.4], c: [0, 2.0, -1.8], f: 38 },
  { t: 45.4, p: [-4.2, 3.2, -6.4], c: [0, 2.7, 0.6], f: 38 },
  { t: 47.2, p: [-3.0, 3.0, -6.2], c: [0, 3.15, 1.0], f: 38 },
  { t: 53.4, p: [-3.4, 3.1, -6.8], c: [0, 3.0, 0.6], f: 38 },
  { t: 55.6, p: [-10.5, 5.2, -10.5], c: [0, 3.2, 2.0], f: 36 },
  { t: 57.0, p: [-5.5, 6.2, -10.0], c: [0, 3.0, 2.4], f: 36 },
  { t: 58.8, p: [9.0, 5.0, 0.4], c: [0, 2.7, 2.6], f: 38 },
  { t: 64.4, p: [9.4, 4.4, 2.4], c: [0, 2.5, 2.8], f: 38 },
  { t: 65.6, p: [9.0, 6.5, 19.5], c: [0, 2.8, 14.5], f: 38 },
  { t: 68.6, p: [7.0, 5.4, 16.2], c: [0, 2.9, 12.0], f: 38 },
  { t: 70.4, p: [5.0, 7.2, 15.2], c: [0, 2.9, 9.8], f: 38 },
  { t: 71.4, p: [2.6, 3.7, 4.0], c: [0, 3.0, 7.6], f: 40 },
  { t: 73.4, p: [2.5, 3.6, 4.4], c: [-0.1, 2.9, 7.0], f: 40 },
  { t: 74.8, p: [6.0, 3.9, 7.6], c: [0, 3.0, 6.5], f: 38 },
  { t: 76.6, p: [6.0, 3.9, 7.0], c: [0, 3.0, 6.0], f: 38 },
  { t: 78.6, p: [6.2, 3.9, 6.4], c: [0, 2.9, 4.8], f: 38 },
  { t: 80.4, p: [5.2, 4.0, 5.9], c: [0, 2.7, 3.4], f: 38 },
  { t: 84.0, p: [5.0, 3.9, 5.6], c: [0, 2.7, 3.3], f: 38 },
  { t: 86.0, p: [16, 7.5, -9], c: [0, 3.0, 3.0], f: 36 },
  { t: 89.0, p: [19, 9.0, -14], c: [0, 3.0, 4.0], f: 36 },
];
export function cameraAt(t) {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++;
  const a = CAM[i], b = CAM[i + 1], s = smooth(a.t, b.t, t);
  return { p: a.p.map((v, k) => lerp(v, b.p[k], s)), c: a.c.map((v, k) => lerp(v, b.c[k], s)), f: lerp(a.f, b.f, s) };
}

// Labels: plain names. Numbers only where G-3_results.md section B has them.
const at = (x, y, z) => () => [x, y, z];
export const LABELS = [
  { t0: 0.6, t1: 5.6, text: 'Moon Base node', at: at(0, 5.6, G.zNode), d: [40, -90] },
  { t0: 0.6, t1: 5.6, text: 'Habitat module', at: at(-7.0, 5.1, G.zNode), d: [-40, -90] },
  { t0: 0.6, t1: 5.6, text: 'G-3 garage, 4.2 m dia x 7.76 m', at: at(0, 5.1, 3.2), d: [-150, -110] },
  { t0: 2.0, t1: 5.6, text: 'Regolith berm', at: at(0, 1.3, -9.5), d: [-120, 40] },
  { t0: 11.6, t1: 15.4, text: 'Curved plug door', at: S => S.leafAt(1.2, -0.5, true), d: [-170, -120] },
  { t0: 20.4, t1: 22.0, text: 'Bridge lip', at: at(-0.6, 2.16, 0.15), d: [-150, -60] },
  { t0: 20.4, t1: 22.0, text: 'Sill trough', at: at(0.5, 2.06, 0.16), d: [70, 80] },
  { t0: 23.0, t1: 25.6, text: 'Ramp tracks, open bar grate', at: S => S.trackAt(), d: [-160, -90] },
  { t0: 26.0, t1: 28.0, text: 'Regolith berm', at: at(-0.6, 1.3, -7.2), d: [-120, 60] },
  { t0: 29.0, t1: 33.0, text: 'SLED75, loader and tiller', at: S => S.sledAt(0.62), d: [-60, -110] },
  { t0: 54.0, t1: 57.0, text: 'Door force 303 kN', at: S => S.leafAt(0.75, -0.4, true), d: [-150, 90] },
  { t0: 58.8, t1: 61.8, text: 'SLED75', at: S => S.sledAt(0.62), d: [-40, -110] },
  { t0: 58.8, t1: 61.8, text: 'Door tracks under the roof', at: at(-G.trackXc, 4.01, 1.4), d: [-60, -80] },
  { t0: 59.4, t1: 63.0, text: 'Floor grating', at: at(-1.0, 2.15, 4.4), d: [60, -120] },
  { t0: 61.6, t1: 64.6, text: 'Under-floor hopper', at: at(0.3, 1.7, 1.2), d: [70, 80] },
  { t0: 61.6, t1: 64.6, text: 'Ramp track channel', at: at(-trackX, CH.yb + 0.07, 3.6), d: [-40, 110] },
  { t0: 65.8, t1: 69.5, text: 'Habitat module', at: at(0, 5.0, G.zNode + 6), d: [40, -70] },
  { t0: 68.6, t1: 70.8, text: 'Node', at: at(0, 4.6, G.zNode), d: [60, -80] },
  { t0: 71.6, t1: 74.0, text: 'Rear port and adapter', at: at(0, 4.0, RP.collar.faceZ + 0.05), d: [-80, -110] },
  { t0: 74.6, t1: 76.8, text: 'Dust lock and shower', at: at(0, 4.3, 6.72), d: [-60, -90] },
  { t0: 77.0, t1: 79.6, text: 'Hatch to the shop', at: at(0, 3.8, G.bulkApex), d: [-70, -90] },
];

// ---------------------------------------------------------------- helpers
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.18, ...o });
function lathe(pts, seg = 128) { const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg); g.rotateX(Math.PI / 2); g.computeVertexNormals(); return g; }
function mesh(g, m, shadow = true) { const x = new THREE.Mesh(g, m); x.castShadow = shadow; x.receiveShadow = true; return x; }
function box(w, h, d, m, x = 0, y = 0, z = 0) { const b = mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); return b; }
const place = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const c = g.clone(); c.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1))); return c; };
const merged = list => mergeGeometries(list.map(g => (g.index ? g.toNonIndexed() : g)));
const bx = (w, h, d, x, y, z) => place(new THREE.BoxGeometry(w, h, d), x, y, z);
function roundRect(w, h, r, cx = 0, cy = 0) { const s = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function rrPath(w, h, r) { const p = new THREE.Path(), x = -w / 2, y = -h / 2; p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r); p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h); p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r); p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); return p; }
function rod(a, b, r, seg = 14) { const d = new THREE.Vector3().subVectors(b, a), l = d.length(), g = new THREE.CylinderGeometry(r, r, l, seg), m = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate(m.x, m.y, m.z); return g; }
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
// Reverse the winding of a geometry (normals flip). Used to give walls an inner face.
function flipped(g) { g = g.clone(); if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; } g.index.needsUpdate = true; }
  else for (const k of Object.keys(g.attributes)) { const at = g.attributes[k], n = at.itemSize; for (let i = 0; i < at.count; i += 3) for (let c = 0; c < n; c++) { const t = at.array[(i + 1) * n + c]; at.array[(i + 1) * n + c] = at.array[(i + 2) * n + c]; at.array[(i + 2) * n + c] = t; } at.needsUpdate = true; }
  g.computeVertexNormals(); return g; }
// Section cap: a twin that draws the back faces of a closed wall in a flat colour, so a cut wall reads as solid
function capped(m, capMat) { const c = new THREE.Mesh(m.geometry, capMat); c.castShadow = false; m.add(c); return m; }
// Surface between a rounded rectangle on the axis and a circle of radius R, at z = zf(r). Local y about the axis.
function holeDisc(hw, hh, cr, R, zf, N = 192, M = 16) {
  const inside = (x, y) => { const ax = Math.abs(x), ay = Math.abs(y); if (ax > hw || ay > hh) return false; const dx = ax - (hw - cr), dy = ay - (hh - cr); return !(dx > 0 && dy > 0) || dx * dx + dy * dy <= cr * cr; };
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const th = i / N * Math.PI * 2, c = Math.cos(th), s = Math.sin(th); let lo = 0, hi = Math.hypot(hw, hh) + 0.01;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (inside(m * c, m * s)) lo = m; else hi = m; }
    for (let j = 0; j <= M; j++) { const r = lo + (R - lo) * j / M; pos.push(r * c, r * s, zf(r)); }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// Moving short streaks along polylines, for air and dust
function streaks(scene, paths, { color = 0x2a2a28, len = 0.35, speed = 1.6, period = 4, opacity = 0.75, points = 0.03 } = {}) {
  const n = paths.length, pos = new Float32Array(n * 6), ppos = new Float32Array(n * 3);
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lm = new THREE.LineBasicMaterial({ color, transparent: true, opacity }), lines = new THREE.LineSegments(lg, lm); lines.frustumCulled = false; scene.add(lines);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  const pm = new THREE.PointsMaterial({ color, size: points, transparent: true, opacity }), pts = new THREE.Points(pg, pm); pts.frustumCulled = false; scene.add(pts);
  const P = paths.map(p => { const L = [0]; for (let k = 1; k < p.pts.length; k++) L.push(L[k - 1] + p.pts[k].distanceTo(p.pts[k - 1])); return { ...p, L }; });
  const atS = (p, s) => { s = Math.max(0, Math.min(p.L[p.L.length - 1], s)); let k = 1; while (k < p.L.length - 1 && p.L[k] < s) k++; const f = (s - p.L[k - 1]) / Math.max(1e-6, p.L[k] - p.L[k - 1]); return p.pts[k - 1].clone().lerp(p.pts[k], f); };
  return {
    update(t, k) {
      lines.visible = pts.visible = k > 0.01; if (!lines.visible) return; lm.opacity = pm.opacity = opacity * k;
      P.forEach((p, i) => {
        const tot = p.L[p.L.length - 1], cyc = (t * speed * p.v + p.ph * period * speed) % (period * speed);
        if (cyc > tot) { for (let q = 0; q < 6; q++) pos[i * 6 + q] = 0; ppos[i * 3] = 0; ppos[i * 3 + 1] = -9; ppos[i * 3 + 2] = 0; return; }
        const a = atS(p, cyc), b = atS(p, cyc - len); pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); ppos.set([a.x, a.y, a.z], i * 3);
      });
      lg.attributes.position.needsUpdate = true; pg.attributes.position.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- scene
export function buildScene(opt = {}) {
  const scene = new THREE.Scene(), BG = opt.bg || 0xf4f3ef;
  scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 95, 230);
  const clipX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 40);   // vessel cutaway, keeps x below the constant
  const clipM = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 40);   // habitat and node cutaway
  const X = [clipX], MM = [clipM];
  const M = {
    skin: mat(0xd2d1ca, { clippingPlanes: X, metalness: 0.2 }),
    rib: mat(0x9a9992, { clippingPlanes: X }),
    jacket: mat(0xf0efe8, { roughness: 0.85, metalness: 0, clippingPlanes: X }), jacketD: mat(0xf0efe8, { side: THREE.DoubleSide, roughness: 0.85, metalness: 0, clippingPlanes: X }),
    cap: new THREE.MeshBasicMaterial({ color: 0x5f5e59, side: THREE.BackSide, clippingPlanes: X }), capM: new THREE.MeshBasicMaterial({ color: 0x5f5e59, side: THREE.BackSide, clippingPlanes: MM }),
    steelX: mat(0x8a8982, { roughness: 0.45, metalness: 0.45, clippingPlanes: X }), lockF: mat(0xe3e2db, { clippingPlanes: X }), hInner: mat(0xd2d1c9, { roughness: 0.7, metalness: 0.1, clippingPlanes: MM }),
    seam: mat(0xcfcec6, { roughness: 0.9, metalness: 0, clippingPlanes: X }),
    frame: mat(0x7b7a74, { roughness: 0.45, metalness: 0.4, clippingPlanes: X }), darkX: mat(0x4a4a46, { roughness: 0.5, metalness: 0.4, clippingPlanes: X }),
    seal: mat(0x232323, { roughness: 0.8, metalness: 0, clippingPlanes: X }),
    leaf: mat(0xc4c3bb, { metalness: 0.25, roughness: 0.5, clippingPlanes: X }), leafRib: mat(0x93928a, { metalness: 0.3, clippingPlanes: X }),
    move: mat(0xb4472a, { roughness: 0.5 }), moveX: mat(0xb4472a, { roughness: 0.5, clippingPlanes: X }),
    steel: mat(0x8a8982, { roughness: 0.45, metalness: 0.45 }), dark: mat(0x4a4a46, { roughness: 0.5, metalness: 0.4 }),
    deck: mat(0x6f6e68, { clippingPlanes: X, metalness: 0.3, roughness: 0.55 }), deckU: mat(0x6f6e68, { metalness: 0.3, roughness: 0.55 }),
    plenum: mat(0x5e5d57, { side: THREE.DoubleSide, clippingPlanes: X }),
    lock: mat(0xe3e2db, { side: THREE.DoubleSide, clippingPlanes: X }),
    equip: mat(0xd8d7cf, { roughness: 0.6, metalness: 0.2 }), equipD: mat(0x8c8b84, { roughness: 0.55, metalness: 0.3 }),
    tank: mat(0xb3b2aa, { metalness: 0.5, roughness: 0.35 }), pipe: mat(0x7d7c75, { roughness: 0.5, metalness: 0.4 }),
    cradle: mat(0x9a9992, { roughness: 0.6, metalness: 0.3 }),
    ground: mat(0xd6d4cc, { roughness: 1, metalness: 0 }),
    hHull: mat(0xd9d4c6, { roughness: 0.86, metalness: 0, clippingPlanes: MM }),
    hStrap: mat(0x8c7355, { roughness: 0.8, metalness: 0.05, clippingPlanes: MM }),
    hMetal: mat(0xb0aea4, { side: THREE.DoubleSide, roughness: 0.5, metalness: 0.4, clippingPlanes: MM }),
    hLeg: mat(0x8a8982, { roughness: 0.45, metalness: 0.45, clippingPlanes: MM }),
    mDark: mat(0x3d3e42, { side: THREE.DoubleSide, roughness: 0.5, metalness: 0.4, clippingPlanes: MM }),
    mBox: mat(0xdedcd3, { roughness: 0.8, metalness: 0.05, clippingPlanes: MM }),
    mInner: mat(0xd2d1c9, { side: THREE.DoubleSide, roughness: 0.7, metalness: 0.1, clippingPlanes: MM }),
    mFloor: mat(0x77766f, { side: THREE.DoubleSide, clippingPlanes: MM }),
    mMetal: mat(0xbdbcb5, { side: THREE.DoubleSide, roughness: 0.42, metalness: 0.55, clippingPlanes: MM }),
    array: mat(0x27335a, { side: THREE.DoubleSide, roughness: 0.28, metalness: 0.55 }), arrayF: mat(0xaeb0b4, { roughness: 0.45, metalness: 0.5 }),
  };

  // Ground and berm
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tc = document.createElement('canvas'); tc.width = tc.height = 512; const tx = tc.getContext('2d');
  tx.fillStyle = '#fff'; tx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) { const g = 205 + rnd() * 50 | 0; tx.fillStyle = 'rgb(' + g + ',' + g + ',' + (g - 3) + ')'; const r = rnd() * 2.4; tx.fillRect(rnd() * 512, rnd() * 512, r, r); }
  const tex = new THREE.CanvasTexture(tc); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(48, 48); tex.colorSpace = THREE.SRGBColorSpace; M.ground.map = tex;
  const gnd = mesh(new THREE.CircleGeometry(240, 96), M.ground, false); gnd.rotation.x = -Math.PI / 2; scene.add(gnd);
  { const zA = bermToe - 1, zB = bermNearToe + 0.6, wx = 2 * (BM.top.width / 2 + BM.sideSlopeHV * BM.height) + 1.2;
    const bg = new THREE.PlaneGeometry(wx, zB - zA, 64, 190); bg.rotateX(-Math.PI / 2); bg.translate(0, 0, (zA + zB) / 2);
    const p = bg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = bermY(x, z), n = 0.5 + 0.5 * Math.sin(x * 2.3 + z * 1.7) * Math.cos(x * 1.1 - z * 2.9); p.setY(i, y > 0.002 ? y + (y < BM.height - 0.02 ? 0.025 * n : 0) : -0.02); }
    bg.computeVertexNormals(); const t3 = tex.clone(); t3.repeat.set(4, 16); t3.needsUpdate = true;
    scene.add(mesh(bg, mat(0xbfbcb1, { roughness: 1, metalness: 0, map: t3 }))); }

  // ------------------------------------------------ pressure vessel
  const ves = new THREE.Group(); ves.position.y = G.ax; scene.add(ves);
  ves.add(capped(mesh(lathe([[G.Ri, G.zTan], [G.Ri, G.zBulk]]), M.skin), M.cap));
  { const pts = []; for (let i = 0; i <= 40; i++) { const r = G.Ri - (G.Ri - RP.collar.dia / 2) * i / 40; pts.push([r, G.domeC + Math.sqrt(G.domeR ** 2 - r * r)]); } ves.add(capped(mesh(lathe(pts.reverse()), M.skin), M.cap)); }
  for (let z = 0.55; z < G.zTan - 0.1; z += 0.95) ves.add(mesh(lathe([[G.Ri - 0.05, z], [G.Ri, z], [G.Ri, z + 0.06], [G.Ri - 0.05, z + 0.06], [G.Ri - 0.05, z]]), M.rib));
  // MLI and MMOD jacket, front annulus, cylinder and rear dome
  const jR = G.Ro, jDome = G.domeR + (G.Ro - G.Ri), jT = G.domeC + Math.sqrt(jDome ** 2 - jR ** 2);
  ves.add(capped(mesh(lathe([[jR, G.zBulk - 0.05], [jR, jT]]), M.jacket), M.cap));
  { const pts = []; for (let i = 0; i <= 40; i++) { const r = jR - (jR - RP.collar.dia / 2) * i / 40; pts.push([r, G.domeC + Math.sqrt(jDome ** 2 - r * r)]); } ves.add(capped(mesh(lathe(pts), M.jacket), M.cap)); }
  for (const z of [0.4, 1.9, 3.4, 4.9, 6.4]) ves.add(mesh(lathe([[jR, z], [jR + 0.008, z], [jR + 0.008, z + 0.025], [jR, z + 0.025], [jR, z]]), M.seam));
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, l = box(0.012, 0.03, jT - G.zBulk - 0.3, M.seam, Math.cos(a) * (jR + 0.005), Math.sin(a) * (jR + 0.005), (jT + G.zBulk) / 2); l.rotation.z = a; ves.add(l); }
  // Front bulkhead: flat annulus round the door frame, jacket on its outer face, radial stiffeners inside
  ves.add(capped(mesh(holeDisc(G.fW / 2, G.fH / 2, 0.16, G.Ri, () => G.zBulk), M.skin), M.cap));
  ves.add(capped(mesh(flipped(holeDisc(G.fW / 2, G.fH / 2, 0.16, jR, () => G.zBulk - 0.05)), M.jacket), M.cap));
  { const st = []; for (const a of [0.35, 0.9, 1.57, 2.24, 2.79, 3.49, 4.71, 5.93]) { const c = Math.cos(a), s = Math.sin(a); let r0 = 0; while (Math.abs(r0 * c) < G.fW / 2 + 0.02 && Math.abs(r0 * s) < G.fH / 2 + 0.02) r0 += 0.01; const l = G.Ri - r0; st.push(place(new THREE.BoxGeometry(0.04, l, 0.14), (r0 + l / 2) * c, (r0 + l / 2) * s, G.zBulk + 0.09, 0, 0, a - Math.PI / 2)); }
    ves.add(mesh(merged(st), M.rib)); }
  // Livery: SpaceDIRT mark and wordmark on both flanks, black band aft
  { const lt = new THREE.CanvasTexture(liveryCanvas()); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 8;
    const lm = new THREE.MeshStandardMaterial({ map: lt, transparent: true, roughness: 0.75, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, clippingPlanes: X });
    const flank = (side, z0, z1, a0, a1, r) => { const nz = 40, na = 16, pos = [], uv = [], idx = [];
      for (let i = 0; i <= nz; i++) for (let j = 0; j <= na; j++) { const u = i / nz, w = j / na, z = z0 + (z1 - z0) * u, a = a0 + (a1 - a0) * w; pos.push(side * r * Math.cos(a), r * Math.sin(a), z); uv.push(side < 0 ? u : 1 - u, w); }
      for (let i = 0; i < nz; i++) for (let j = 0; j < na; j++) { const p = i * (na + 1) + j; idx.push(p, p + na + 1, p + 1, p + 1, p + na + 1, p + na + 2); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
    const L0 = 0.55, L1 = 3.95, hgt = (L1 - L0) / 4, a0 = 0.04;
    for (const s of [-1, 1]) ves.add(new THREE.Mesh(flank(s, L0, L1, a0, a0 + hgt / (jR + 0.006), jR + 0.006), lm));
    const blk = mat(0x17181a, { roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide, clippingPlanes: X });
    ves.add(mesh(lathe([[jR + 0.004, 4.55], [jR + 0.004, 4.95]]), blk, false)); ves.add(mesh(lathe([[jR + 0.004, 5.06], [jR + 0.004, 5.13]]), blk, false)); }

  // ------------------------------------------------ door frame (seal lands follow the leaf arc), seals, sill trough
  const yD = G.deckY;
  const C0 = G.closed.bottomRollerYZ, Rin = G.arcR, Rout = G.arcR + G.lT, uc = G.arcC[0], wc = G.arcC[1];
  const wIn = u => wc + Math.sqrt(Math.max(0, Rin * Rin - (u - uc) ** 2)), wOut = u => wc + Math.sqrt(Math.max(0, Rout * Rout - (u - uc) ** 2));
  const sealZ = y => C0[1] - wOut(y - C0[0]);       // frame inner face, where the closed leaf's convex face lands
  const innerZ = y => C0[1] - wIn(y - C0[0]);       // closed leaf, concave inner face
  const denseRR = (w, h, r, step = 0.04) => {        // rounded rectangle outline with points every step, so a warp bends it
    const pts = [], x0 = -w / 2, y0 = -h / 2, seg = (ax, ay, bx2, by2) => { const n = Math.max(1, Math.ceil(Math.hypot(bx2 - ax, by2 - ay) / step)); for (let i = 0; i < n; i++) pts.push(new THREE.Vector2(ax + (bx2 - ax) * i / n, ay + (by2 - ay) * i / n)); };
    const arc = (cx, cy, a0) => { for (let i = 0; i < 6; i++) { const a = a0 + Math.PI / 2 * i / 6; pts.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a))); } };
    seg(x0 + r, y0, x0 + w - r, y0); arc(x0 + w - r, y0 + r, -Math.PI / 2); seg(x0 + w, y0 + r, x0 + w, y0 + h - r); arc(x0 + w - r, y0 + h - r, 0);
    seg(x0 + w - r, y0 + h, x0 + r, y0 + h); arc(x0 + r, y0 + h - r, Math.PI / 2); seg(x0, y0 + h - r, x0, y0 + r); arc(x0 + r, y0 + r, Math.PI); return pts;
  };
  const ringShape = (wo, ho, ro, wi, hi, ri) => { const s = new THREE.Shape(denseRR(wo, ho, ro)); s.holes.push(new THREE.Path(denseRR(wi, hi, ri).reverse())); return s; };
  { const f = new THREE.ExtrudeGeometry(ringShape(G.fW, G.fH, 0.16, G.oW, G.oH, 0.1), { depth: G.fZ1 - G.fZ0, bevelEnabled: false });
    const p = f.attributes.position; for (let i = 0; i < p.count; i++) if (p.getZ(i) > (G.fZ1 - G.fZ0) - 0.01) p.setZ(i, (G.fZ1 - G.fZ0) + sealZ(p.getY(i) + G.ax)); f.computeVertexNormals();
    const fm = capped(mesh(f, M.frame), M.cap); fm.position.set(0, G.ax, G.fZ0); scene.add(fm);
    for (const off of G.seal) {
      const g = new THREE.ExtrudeGeometry(ringShape(G.oW + 2 * off + 0.016, G.oH + 2 * off + 0.016, 0.1 + off, G.oW + 2 * off - 0.016, G.oH + 2 * off - 0.016, 0.1 + off), { depth: 0.012, bevelEnabled: false });
      const q = g.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, q.getZ(i) + sealZ(q.getY(i) + G.ax)); g.computeVertexNormals();
      const sm = mesh(g, M.seal, false); sm.position.set(0, G.ax, 0); scene.add(sm);
    } }
  { const tr = G.trough, w = 2 * 1.56, d = tr.z[1] - tr.z[0];     // drawn 3.12 m wide so the leaf's lower corners have room (json 2.88)
    scene.add(box(w, 0.02, d, M.frame, 0, tr.y[0] - 0.01, (tr.z[0] + tr.z[1]) / 2));
    scene.add(box(w, tr.y[1] - tr.y[0], 0.02, M.frame, 0, (tr.y[0] + tr.y[1]) / 2, tr.z[1] - 0.01));
    for (const s of [-1, 1]) scene.add(box(0.02, tr.y[1] - tr.y[0], d, M.frame, s * 1.56, (tr.y[0] + tr.y[1]) / 2, (tr.z[0] + tr.z[1]) / 2)); }

  // ------------------------------------------------ curved plug leaf, built in its own frame (x across, u along the chord, w to the convex face)
  const leafG = new THREE.Group(); leafG.matrixAutoUpdate = false; scene.add(leafG);
  const uvw = (sx, sy, sz, x0) => new THREE.Matrix4().set(0, 0, 1, x0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1);   // shape (u, w, depth) -> (x, u, w)
  { const s = new THREE.Shape(); G.arcIn.forEach((p, i) => s[i ? 'lineTo' : 'moveTo'](p[0], p[1])); for (let i = G.arcOut.length - 1; i >= 0; i--) s.lineTo(G.arcOut[i][0], G.arcOut[i][1]); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: G.lW, bevelEnabled: false }); g.applyMatrix4(uvw(0, 0, 0, -G.lW / 2)); g.computeVertexNormals();
    leafG.add(capped(mesh(g, M.leaf), M.cap));
    const rib = (x, t = 0.04) => { const r = new THREE.Shape(), us = []; for (let i = 0; i <= 24; i++) us.push(G.lH * i / 24);
      us.forEach((u, i) => r[i ? 'lineTo' : 'moveTo'](u, wIn(u) - 0.002)); for (let i = us.length - 1; i >= 0; i--) r.lineTo(us[i], Math.max(0, wIn(us[i]) - 0.035)); r.closePath();
      const q = new THREE.ExtrudeGeometry(r, { depth: t, bevelEnabled: false }); q.applyMatrix4(uvw(0, 0, 0, x - t / 2)); return q; };
    const rb = [-1.0, 0, 1.0, -(G.lW / 2 - 0.03), G.lW / 2 - 0.03].map(x => rib(x));
    for (const u of [0.63, 1.27]) rb.push(place(new THREE.BoxGeometry(G.lW - 0.12, 0.04, 0.03), 0, u, wIn(u) - 0.017));
    leafG.add(mesh(merged(rb), M.leafRib));
    const hw = []; for (const sx of [-1, 1]) for (const u of [0, G.pitch]) {           // rollers, axles and carriage plates
      hw.push(place(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 18), sx * G.rollerX, u, 0, 0, 0, Math.PI / 2));
      hw.push(place(new THREE.CylinderGeometry(0.011, 0.011, G.rollerX - G.lW / 2 + 0.02, 10), sx * (G.lW / 2 + G.rollerX) / 2, u, 0, 0, 0, Math.PI / 2));
      hw.push(place(new THREE.BoxGeometry(0.02, 0.12, 0.06), sx * (G.lW / 2 + 0.005), u + (u ? -0.04 : 0.06), 0.02)); }
    leafG.add(mesh(merged(hw), M.steelX)); }
  // Leaf pose along the track: top roller at arc length s on the centreline, bottom roller 1.84 m behind on the same track
  const TP = G.trackPts, TL = [0]; for (let i = 1; i < TP.length; i++) TL.push(TL[i - 1] + Math.hypot(TP[i][0] - TP[i - 1][0], TP[i][1] - TP[i - 1][1]));
  const trackAtS = s => polyAt(TP, TL, s);
  function leafPose(sTop) { const A = trackAtS(sTop); let lo = Math.max(0, sTop - 3 * G.pitch), hi = sTop;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2, B = trackAtS(m); if (Math.hypot(A[0] - B[0], A[1] - B[1]) > G.pitch) lo = m; else hi = m; }
    const B = trackAtS((lo + hi) / 2), cy = (A[0] - B[0]) / G.pitch, cz = (A[1] - B[1]) / G.pitch; return { b: B, c: [cy, cz] }; }
  const sTop0 = G.pitch;                                                                   // top roller at the top of the vertical run
  let sLift = sTop0; { let lo = sTop0, hi = sTop0 + 0.6; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (leafPose(m).b[0] < C0[0] + G.lift) lo = m; else hi = m; } sLift = (lo + hi) / 2; }
  const sPark = (() => { const z = G.parked.topRollerYZ[1]; for (let i = 1; i < TP.length; i++) if (Math.abs(TP[i][0] - TP[i - 1][0]) < 1e-6 && TP[i][1] >= z) return TL[i - 1] + (z - TP[i - 1][1]); return TL[TL.length - 1]; })();
  const leafM = new THREE.Matrix4();
  function setLeaf(b, c) { const n = [c[1], -c[0]]; leafM.set(-1, 0, 0, 0, 0, c[0], n[0], b[0], 0, c[1], n[1], b[1], 0, 0, 0, 1); leafG.matrix.copy(leafM); leafG.matrixWorldNeedsUpdate = true; }
  setLeaf(C0, [1, 0]);
  // Door tracks: a C channel a side along the json centreline, open toward the leaf; entry blocks for the in-move; brackets; drive
  { const parts = [], ch = G.channel, xo = G.trackXc;
    for (const sx of [-1, 1]) for (let i = 1; i < TP.length; i++) {
      const a = TP[i - 1], b2 = TP[i], len = Math.hypot(b2[0] - a[0], b2[1] - a[1]); if (len < 1e-6) continue;
      const ty = (b2[0] - a[0]) / len, tz = (b2[1] - a[1]) / len, th = Math.atan2(tz, ty), my = (a[0] + b2[0]) / 2, mz = (a[1] + b2[1]) / 2, ny = -tz, nz = ty;
      parts.push(place(new THREE.BoxGeometry(0.006, len + 0.012, ch.depth), sx * (xo + ch.width / 2 - 0.003), my, mz, th, 0, 0));
      for (const e of [-1, 1]) parts.push(place(new THREE.BoxGeometry(ch.width, len + 0.012, 0.006), sx * xo, my + e * (ch.depth / 2 - 0.003) * ny, mz + e * (ch.depth / 2 - 0.003) * nz, th, 0, 0));
    }
    for (const sx of [-1, 1]) for (const y of [C0[0], G.closed.topRollerYZ[0]]) parts.push(bx(0.07, 0.07, 0.15, sx * (xo + 0.02), y, (C0[1] + TP[0][1]) / 2 - 0.02));
    for (const sx of [-1, 1]) for (const y of [2.25, 2.75, 3.25, 3.75]) parts.push(bx(0.04, 0.05, TP[0][1] - G.zBulk, sx * (xo + 0.035), y, (TP[0][1] + G.zBulk) / 2));
    for (const sx of [-1, 1]) for (const z of [0.75, 1.45, 2.15]) { const yTop = G.ax + Math.sqrt(G.Ri ** 2 - (xo + 0.02) ** 2); parts.push(bx(0.04, yTop - 4.05, 0.05, sx * (xo + 0.02), (yTop + 4.05) / 2, z)); }
    scene.add(mesh(merged(parts), M.darkX));
    const zEnd = TP[TP.length - 1][1];
    for (const sx of [-1, 1]) { const m = box(0.16, 0.13, 0.22, M.darkX, sx * (xo - 0.02), 4.02, zEnd + 0.13); scene.add(m); }
  }
  const CUT = 0.66, CUTM = 0.6;          // cutaway planes: just outboard of the centred parts so they stay whole
  // Latch units on the frame, three a side; the bolts slide in x over the leaf's inner face
  const bolts = [];
  { const hs = []; for (const s of [-1, 1]) for (const y of [2.5, 3.0, 3.5]) { const zi = innerZ(y), zs = sealZ(y);
      hs.push(bx(0.13, 0.16, zi + 0.075 - zs, s * 1.665, y, (zi + 0.075 + zs) / 2));
      const bt = box(0.14, 0.06, 0.034, M.moveX, 0, y, zi + 0.017); bt.userData.s = s; scene.add(bt); bolts.push(bt); }
    scene.add(mesh(merged(hs), M.frame)); }
  // Bridge lip, hinged at the sill 0.15 m out from the seal plane; stands up in front of the closed leaf, folds down over the trough
  const lipG = new THREE.Group(); lipG.position.set(0, yD + 0.002, G.lip.z[0]); scene.add(lipG);
  { const L = G.lip.z[1] - G.lip.z[0], W = G.lip.x[1] - G.lip.x[0], p = [bx(W, G.lipT, L, 0, -G.lipT / 2, L / 2)];
    lipG.add(mesh(merged(p), M.darkX));
    const tread = []; for (let i = 0; i < 7; i++) tread.push(bx(W - 0.1, 0.008, 0.02, 0, 0.003, 0.06 + i * 0.085)); lipG.add(mesh(merged(tread), M.frame));
    const hp = mesh(new THREE.CylinderGeometry(0.03, 0.03, W, 14), M.steel); hp.rotation.z = Math.PI / 2; hp.position.y = -0.02; lipG.add(hp); }

  // ------------------------------------------------ deck plate (grated), guide mouths, channels under the deck, joists
  const RS = GEO.ramp.stowed, CV = GEO.ramp.guideCovers, laneX = [CV[1].x[0], CV[1].x[1]];
  const inLane = x => Math.abs(x) > laneX[0] - 0.005 && Math.abs(x) < laneX[1] + 0.005;
  const zBayEnd = x => zBulkAt(x, yD) - 0.02, zLockEnd = x => zDomeAt(x, yD) - 0.02, zLock0 = x => zBulkAt(x, yD) + 0.05;
  { const bars = [], pitch = 0.07, bw = 0.012, bh = 0.035, yb = yD - bh / 2;
    for (let x = -G.deckHalf + 0.04; x <= G.deckHalf - 0.04; x += pitch) {
      const runs = inLane(x) ? [[G.deckZ0, CH.zS0], [CH.zMouth, zBayEnd(x)]] : [[G.deckZ0, zBayEnd(x)]];
      runs.push([zLock0(x), zLockEnd(x)]);
      for (const [a, b] of runs) if (b > a + 0.02) bars.push(bx(bw, bh, b - a, x, yb, (a + b) / 2));
    }
    for (let z = G.deckZ0 + 0.06; z < zLockEnd(0); z += 0.15) {
      if (z > zBayEnd(0) - 0.03 && z < zLock0(0) + 0.03) continue;
      let hw = z < zBayEnd(0) ? G.deckHalf - 0.03 : Math.sqrt(Math.max(0, G.domeR ** 2 - (z - G.domeC) ** 2 - (yD - G.ax) ** 2)) - 0.04;
      if (z > zBayEnd(0) && z < zLock0(G.deckHalf)) hw = Math.min(hw, Math.sqrt(Math.max(0, G.bulkR ** 2 - (G.bulkC - z) ** 2 - (yD - G.ax) ** 2)));
      const segs = (z > CH.zS0 && z < CH.zMouth) ? [[-hw, -laneX[1]], [-laneX[0], laneX[0]], [laneX[1], hw]] : [[-hw, hw]];
      for (const [a, b] of segs) if (b > a) bars.push(bx(b - a, 0.012, 0.014, (a + b) / 2, yD - 0.006, z));
    }
    for (let z = 0.6; z < 7.0; z += 0.6) { if (Math.abs(z - zBulkAt(0, yD)) < 0.12) continue; const hw = Math.min(halfChord(yD - 0.09), z > zBulkAt(0, yD) ? Math.sqrt(Math.max(0, G.domeR ** 2 - (z - G.domeC) ** 2)) - 0.2 : 9) - 0.02; if (hw > 0.1) bars.push(bx(2 * hw, 0.09, 0.05, 0, yD - 0.08, z)); }
    for (const s of [-1, 1]) bars.push(bx(0.05, 0.06, zBayEnd(G.deckHalf) - G.deckZ0, s * (G.deckHalf - 0.025), yD - 0.03, (zBayEnd(G.deckHalf) + G.deckZ0) / 2));
    scene.add(mesh(merged(bars), M.deck)); }
  // Guide-mouth covers: only the front part, where the chain crosses the deck plane, opens; hinged at its rear edge
  const flaps = [];
  for (const s of [-1, 1]) { const g = new THREE.Group(), b = [], L = CH.zMouth - CH.zS0, W = laneX[1] - laneX[0]; g.position.set(s * (laneX[0] + laneX[1]) / 2, yD, CH.zMouth); scene.add(g);
    for (let x = -W / 2 + 0.035; x < W / 2 - 0.02; x += 0.07) b.push(bx(0.012, 0.035, L - 0.01, x, -0.0175, -L / 2));
    for (let z = 0.05; z < L; z += 0.15) b.push(bx(W - 0.02, 0.012, 0.014, 0, -0.006, -z));
    b.push(bx(W, 0.03, 0.02, 0, -0.02, -L + 0.01));
    g.add(mesh(merged(b), M.deck)); flaps.push(g); }
  // Channels: grated floor and side plates along the chain path, from the rear down-turn through the S-guide
  { const parts = [], P = chain.p, sEnd = chain.sGuideTop;
    for (const sx of [-1, 1]) { const xc = sx * trackX;
      for (let i = 1; i < P.length; i++) { const a = P[i - 1], b2 = P[i]; if (chain.L[i - 1] >= sEnd || Math.max(a[0], b2[0]) > 1.96) break;
        const len = Math.hypot(b2[0] - a[0], b2[1] - a[1]); if (len < 1e-6) continue; const ty = (b2[0] - a[0]) / len, tz = (b2[1] - a[1]) / len, th = Math.atan2(tz, ty), ny = -tz, nz = ty;
        for (const e of [-1, 1]) parts.push(place(new THREE.BoxGeometry(0.012, len + 0.01, 0.17), xc + e * (RA.trackWidth / 2 + 0.025), (a[0] + b2[0]) / 2 + 0.07 * ny, (a[1] + b2[1]) / 2 + 0.07 * nz, th, 0, 0));
        for (const e of [-0.18, 0, 0.18]) parts.push(place(new THREE.BoxGeometry(0.02, len + 0.01, 0.02), xc + e, (a[0] + b2[0]) / 2 - 0.02 * ny, (a[1] + b2[1]) / 2 - 0.02 * nz, th, 0, 0));
      } }
    scene.add(mesh(merged(parts), mat(0x6a6963, { clippingPlanes: X, metalness: 0.35, roughness: 0.5 }))); }
  // Plenum: shell below the deck is the plenum floor; the hopper, filter and compressor sit in it (json allowances)
  { const e = EQ.hopper, w = e.x[1] - e.x[0], L = e.z[1] - e.z[0], yT = e.y[1], yB = e.y[0], zc = (e.z[0] + e.z[1]) / 2;
    const f = new THREE.CylinderGeometry(1, 1, 1, 4, 1, true); f.rotateY(Math.PI / 4); const p = f.attributes.position;
    for (let i = 0; i < p.count; i++) { const top = p.getY(i) > 0, sx = Math.sign(p.getX(i)), sz = Math.sign(p.getZ(i)); p.setXYZ(i, sx * (top ? w / 2 : 0.18), top ? yT : yB + 0.22, zc + sz * (top ? L / 2 : L / 2 - 0.2)); }
    f.computeVertexNormals(); const hop = mesh(f, mat(0xc9c8c1, { side: THREE.DoubleSide, roughness: 0.6, metalness: 0.25 })); scene.add(hop);
    const can = mesh(new THREE.CylinderGeometry(0.11, 0.11, L - 0.3, 24), M.equipD); can.rotation.x = Math.PI / 2; can.position.set(0, yB + 0.11, zc); scene.add(can);
    const lipT = []; lipT.push(bx(w + 0.06, 0.03, 0.04, 0, yT, e.z[0]), bx(w + 0.06, 0.03, 0.04, 0, yT, e.z[1]), bx(0.04, 0.03, L, -w / 2, yT, zc), bx(0.04, 0.03, L, w / 2, yT, zc)); scene.add(mesh(merged(lipT), M.equipD)); }
  const eqBox = (e, m, r = 0.05) => { const w = e.x[1] - e.x[0], h = e.y[1] - e.y[0], L = e.z[1] - e.z[0]; const g = mesh(new THREE.ExtrudeGeometry(roundRect(w, h, r), { depth: L, bevelEnabled: false, curveSegments: 6 }), m); g.position.set((e.x[0] + e.x[1]) / 2, (e.y[0] + e.y[1]) / 2, e.z[0]); scene.add(g); return g; };
  eqBox(EQ.filter, M.equip); eqBox(EQ.compressor, M.equip, 0.08); eqBox(EQ.eclss, M.equip); eqBox(EQ.pdu, M.equip);
  { const fl = []; const e = EQ.filter; for (let i = 0; i < 6; i++) fl.push(bx(0.02, e.y[1] - e.y[0] - 0.12, 0.012, e.x[1] + 0.005, (e.y[0] + e.y[1]) / 2, e.z[0] + 0.12 + i * 0.11));
    const c = EQ.compressor; for (let i = 0; i < 8; i++) fl.push(bx(0.012, 0.03, c.z[1] - c.z[0] - 0.3, c.x[1] + 0.003, c.y[0] + 0.15 + i * 0.06, (c.z[0] + c.z[1]) / 2));
    const k = EQ.eclss; for (let i = 0; i < 5; i++) fl.push(bx(k.x[1] - k.x[0] - 0.12, 0.012, 0.02, (k.x[0] + k.x[1]) / 2, k.y[0] - 0.003, k.z[0] + 0.15 + i * 0.17));
    scene.add(mesh(merged(fl), M.equipD));
    scene.add(mesh(merged([rod(v3(0, 1.32, EQ.hopper.z[1] - 0.12), v3(0, 1.32, EQ.filter.z[0]), 0.07), rod(v3(0, 1.5, EQ.filter.z[1]), v3(0, 1.5, EQ.compressor.z[0]), 0.1)].map(g => g)), M.pipe)); }
  // Gas tanks in the crown, four cylinders, with straps and a manifold
  { const e = EQ.tanks, L = e.z[1] - e.z[0], r = (e.y[1] - e.y[0]) / 4, t = [];
    for (const x of [e.x[0] + r, e.x[1] - r]) for (const y of [e.y[0] + r, e.y[1] - r]) { const c = new THREE.CapsuleGeometry(r * 0.97, L - 2 * r, 10, 24); c.rotateX(Math.PI / 2); c.translate(x, y, (e.z[0] + e.z[1]) / 2); t.push(c); }
    scene.add(mesh(merged(t), M.tank));
    const s = []; for (const z of [e.z[0] + 0.25, e.z[1] - 0.25]) s.push(bx(e.x[1] - e.x[0] + 0.04, 0.03, 0.05, 0, e.y[1] + 0.01, z), bx(0.03, e.y[1] - e.y[0], 0.05, e.x[0] - 0.02, (e.y[0] + e.y[1]) / 2, z), bx(0.03, e.y[1] - e.y[0], 0.05, e.x[1] + 0.02, (e.y[0] + e.y[1]) / 2, z));
    scene.add(mesh(merged(s), M.dark)); }
  // One pipe run: compressor up the left wall to the tanks
  { const c = EQ.compressor, e = EQ.tanks, zp = c.z[1] - 0.2, xw = -1.66, P = [v3(c.x[0], 1.6, zp), v3(-1.45, 1.6, zp), v3(xw, 1.9, zp), v3(xw, 3.9, zp), v3(-1.05, 4.62, zp), v3(-0.32, 4.62, zp), v3(-0.32, 4.62, e.z[1] + 0.05)];
    const g = []; for (let i = 1; i < P.length; i++) g.push(rod(P[i - 1], P[i], 0.035)); for (let i = 1; i < P.length - 1; i++) g.push(place(new THREE.SphereGeometry(0.036, 12, 8), P[i].x, P[i].y, P[i].z));
    g.push(bx(0.66, 0.05, 0.05, 0, 4.62, e.z[1] + 0.05)); scene.add(mesh(merged(g), M.pipe)); }

  // ------------------------------------------------ ramp tracks: plain slat chains (9 segments a side); poses along the chain path
  const tracks = [], SEG = GEO.ramp.articulated, segL = SEG.segmentPitch, segD = SEG.depth, nSeg = SEG.segmentsPerTrack;
  const segGeo = (() => { const W = RA.trackWidth, b = [];
    for (const e of [-1, 1]) b.push(bx(0.04, segD, segL - 0.01, e * (W / 2 - 0.02), segD / 2, segL / 2));
    for (let i = 0; i < 4; i++) b.push(bx(W - 0.06, 0.035, 0.035, 0, segD - 0.0175, 0.07 + i * (segL - 0.14) / 3));
    b.push(bx(0.02, segD - 0.02, segL - 0.02, 0, segD / 2, segL / 2));
    return merged(b); })();
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); scene.add(g); const segs = [];
    for (let k = 0; k < nSeg; k++) { const m = mesh(segGeo, M.move); m.matrixAutoUpdate = false; g.add(m); segs.push(m); }
    tracks.push({ s, g, segs });
  }
  // Segment k runs from chain coordinate tail + k*segL to tail + (k+1)*segL; local frame: x across, z along, y up from the underside
  const segM = new THREE.Matrix4(), tipM = new THREE.Matrix4(), tmpM = new THREE.Matrix4();
  function placeChain(tailS, tip) {
    tipM.identity();
    if (tip > 0) { const drop = (CH.ybOut - (RA.head.y - segD)) * Math.min(1, tip * 3), py = CH.ybOut + segD, pz = RA.head.z;
      tipM.makeTranslation(0, py - drop, pz).multiply(tmpM.makeRotationX(-tipA * tip)).multiply(new THREE.Matrix4().makeTranslation(0, -py, -pz)); }
    for (const { s: sx, segs } of tracks) segs.forEach((m, k) => {
      const a = polyAt(chain.p, chain.L, tailS + k * segL), b2 = polyAt(chain.p, chain.L, tailS + (k + 1) * segL), len = Math.max(1e-6, Math.hypot(b2[0] - a[0], b2[1] - a[1]));
      const dy = (b2[0] - a[0]) / len, dz = (b2[1] - a[1]) / len, ny = -dz, nz = dy;    // local z along the chain (out), local y up
      segM.set(-1, 0, 0, sx * trackX, 0, ny, dy, a[0], 0, nz, dz, a[1], 0, 0, 0, 1);   // x mirrored keeps the frame right-handed
      m.matrix.multiplyMatrices(tipM, segM); m.matrixWorldNeedsUpdate = true;
    });
  }

  // ------------------------------------------------ dust lock: dished bulkhead with Hatch A, shower portal, lock floor (in the grating)
  const hA = G.hatchA;
  { const zf = r => G.bulkC - Math.sqrt(G.bulkR ** 2 - r * r), b = capped(mesh(holeDisc(hA.W / 2 + 0.11, hA.H / 2 + 0.11, 0.2, G.Ri, zf), M.lockF), M.cap); b.position.y = G.ax; scene.add(b);
    const b2 = capped(mesh(flipped(holeDisc(hA.W / 2 + 0.11, hA.H / 2 + 0.11, 0.2, G.Ri - 0.02, r => zf(r) - 0.04)), M.lockF), M.cap); b2.position.y = G.ax; scene.add(b2);
    const s = roundRect(hA.W + 0.22, hA.H + 0.22, 0.2); s.holes.push(rrPath(hA.W, hA.H, 0.12));
    const fr = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false, curveSegments: 10 }), mat(0x8a8982, { clippingPlanes: X, side: THREE.DoubleSide })); fr.position.set(0, G.ax, G.bulkApex - 0.03); scene.add(fr); }
  const hatchLeaf = () => { const h = new THREE.Group(); const l = mesh(new THREE.ExtrudeGeometry(roundRect(hA.W, hA.H, 0.12, hA.W / 2, 0), { depth: 0.05, bevelEnabled: false, curveSegments: 8 }), mat(0xbdbcb5, { metalness: 0.3 })); h.add(l);
    const w = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 24), M.dark); w.rotation.x = Math.PI / 2; w.position.set(hA.W / 2, 0.4, 0.06); h.add(w);
    const hd = box(0.04, 0.2, 0.05, M.dark, hA.W - 0.12, 0, 0.07); h.add(hd); return h; };
  const hatchA = hatchLeaf(); hatchA.position.set(-hA.W / 2, G.ax, G.bulkApex + 0.14); scene.add(hatchA);
  const zSh = 6.72;
  { const p = [], m = mat(0xc9c8c1, { clippingPlanes: X, metalness: 0.3 }); const yT = 4.35;
    for (const s of [-1, 1]) { p.push(bx(0.09, yT - yD, 0.14, s * 0.78, (yT + yD) / 2, zSh)); for (let i = 0; i < 6; i++) p.push(bx(0.03, 0.03, 0.05, s * 0.72, 2.45 + i * 0.3, zSh)); }
    p.push(bx(1.65, 0.09, 0.14, 0, yT, zSh)); for (let i = 0; i < 5; i++) p.push(bx(0.03, 0.03, 0.05, -0.5 + i * 0.25, yT - 0.06, zSh));
    scene.add(mesh(merged(p), m)); }
  // Rear port: collar, passive frame with the 40 x 60 in passage, Hatch B (hinges into the lock), mating adapter
  const PORT = { w: RP.passage.W, h: RP.passage.H, r: RP.collar.dia / 2, z0: RP.collar.zFrom, z: RP.collar.faceZ, y: RP.centre[1] };
  { const col = mesh(new THREE.CylinderGeometry(PORT.r, PORT.r, PORT.z - PORT.z0, 64, 1, true), M.jacketD); col.rotation.x = Math.PI / 2; col.position.set(0, PORT.y, (PORT.z + PORT.z0) / 2); scene.add(col);
    const s = new THREE.Shape(); s.absarc(0, 0, PORT.r + 0.02, 0, Math.PI * 2); s.holes.push(rrPath(PORT.w, PORT.h, 0.12));
    const fr = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false, curveSegments: 48 }), mat(0x7c7b75, { side: THREE.DoubleSide, clippingPlanes: X })); fr.position.set(0, PORT.y, PORT.z - 0.06); scene.add(fr); }
  const hatchB = hatchLeaf(); hatchB.position.set(-PORT.w / 2, PORT.y, PORT.z - 0.12); scene.add(hatchB);
  // Steps at the two hatch sills (0.088 m)
  { const st = []; st.push(bx(0.9, G.hatchSill - yD, 0.22, 0, (G.hatchSill + yD) / 2, PORT.z - 0.17)); scene.add(mesh(merged(st), M.deck)); }

  // ------------------------------------------------ legs, habitat style
  { const s = [], L = G.legs; for (let i = 0; i < L.count; i++) {
      const a = v3(...L.attach[i]), f = v3(...L.feet[i]), sgn = Math.sign(a.x), knee = v3(f.x - sgn * 0.04, 0.62, f.z);
      s.push(rod(a, knee, 0.11, 16), rod(knee, v3(f.x, 0.08, f.z), 0.075, 16));
      s.push(place(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 18), a.x, a.y, a.z, 0, 0, sgn * 0.75), place(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 16), knee.x, knee.y, knee.z));
      s.push(place(new THREE.CylinderGeometry(L.padDia / 2 - 0.04, L.padDia / 2, L.padThickness, 32), f.x, L.padThickness / 2, f.z));
      s.push(place(new THREE.BoxGeometry(0.5, 0.06, 0.6), a.x * 0.98, a.y + 0.03, a.z, 0, 0, sgn * (Math.PI / 2 - Math.atan2(G.ax - a.y, Math.abs(a.x)))));
    }
    scene.add(mesh(merged(s), M.cradle)); }

  // ------------------------------------------------ Moon Base habitats and node (NASA Moon Base concept, Ignition deck slides 29 to 33, scaled)
  const HAB = { R: 2.1, axisY: 3.0, coneL: 1.6, barrelL: 7.4, tipR: 1.1, nodeDist: 11.5, nodeR: 1.5, legZ: [2.5, 5.3, 8.1], hatchW: 1.016, hatchH: 1.524 }, NODE_ARM = 2.1;
  const hullGeo = (() => { const L = HAB.barrelL, R = HAB.R, nA = 12, nZ = 8, g = new THREE.CylinderGeometry(R, R, L, 96, 48, true), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), e = Math.min(1, Math.max(0, (y + L / 2) / L)); const k = 1 + Math.pow(Math.sin(Math.PI * e), 0.3) * (0.016 * Math.pow(Math.abs(Math.sin(nA * a / 2)), 0.6) + 0.016 * Math.pow(Math.abs(Math.sin(Math.PI * nZ * e)), 0.6)); p.setXYZ(i, x * k, y, z * k); }
    g.computeVertexNormals(); g.rotateX(Math.PI / 2); g.translate(0, 0, HAB.coneL + L / 2); return g; })();
  const strapGeo = (() => { const L = HAB.barrelL, R = HAB.R, s = []; for (let i = 1; i < 8; i++) s.push(place(new THREE.TorusGeometry(R + 0.012, 0.018, 6, 96), 0, 0, HAB.coneL + i * L / 8)); for (let i = 0; i < 12; i++) { const a = i * 2 * Math.PI / 12; s.push(place(new THREE.BoxGeometry(0.05, 0.014, L), Math.cos(a) * (R + 0.012), Math.sin(a) * (R + 0.012), HAB.coneL + L / 2, 0, 0, a + Math.PI / 2)); } return merged(s); })();
  const capGeo = (() => { const c = HAB.coneL, b = c + HAB.barrelL, R = HAB.R, T = HAB.tipR; return merged([lathe([[T, 0], [T + 0.1, 0.02], [T + 0.1, 0.16], [T + 0.02, 0.2], [T + 0.08, 0.62], [R - 0.62, c - 0.42], [R - 0.26, c - 0.2], [R - 0.05, c - 0.02], [R + 0.03, c + 0.14], [R - 0.04, c + 0.16]]), lathe([[R - 0.04, b - 0.16], [R + 0.03, b - 0.14], [R - 0.08, b + 0.1], [R - 0.5, b + 0.26], [1.14, b + 0.34], [1.02, b + 0.36], [1.02, HAB.nodeDist - 2.1]])]); })();
  const legGeo = (() => { const R = HAB.R, y0 = -HAB.axisY, s = [], a = 0.82; for (const q of [-1, 1]) for (const z of HAB.legZ) { const top = v3(q * R * Math.cos(a), -R * Math.sin(a), z), mid = v3(q * (R * Math.cos(a) + 0.12), y0 + 0.62, z), foot = v3(q * (R * Math.cos(a) + 0.2), y0 + 0.08, z); s.push(rod(top, mid, 0.11, 12), rod(mid, foot, 0.075, 12), place(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 14), top.x, top.y, top.z), place(new THREE.CylinderGeometry(0.31, 0.36, 0.08, 18), foot.x, y0 + 0.05, foot.z)); } return merged(s); })();
  const whole = q => q.__whole || (q.__whole = Object.assign(q.clone(), { clippingPlanes: [] }));
  const buildModule = cut => { const m = new THREE.Group(), pick = q => (cut ? q : whole(q));
    m.add(mesh(hullGeo, pick(M.hHull)), mesh(strapGeo, pick(M.hStrap)), mesh(capGeo, pick(M.hMetal)), mesh(legGeo, pick(M.hLeg)));
    if (cut) { const inner = g => { const q = flipped(g); q.applyMatrix4(new THREE.Matrix4().makeScale(0.96, 0.96, 1)); return q; };
      m.children[0].add(new THREE.Mesh(hullGeo, M.capM)); m.add(capped(mesh(inner(hullGeo), M.hInner), M.capM)); m.add(capped(mesh(inner(capGeo), M.hInner), M.capM)); }
    const cover = mesh(new THREE.CircleGeometry(HAB.tipR - 0.02, 48), pick(M.mDark)); cover.position.z = 0.06; cover.rotation.y = Math.PI; m.add(cover); return m; };
  const base = new THREE.Group(); scene.add(base); let hatchH = null;
  const zN = G.zNode, D = HAB.nodeDist;
  { const y = HAB.axisY, fy = -HAB.hatchH / 2;
    const a = buildModule(true); a.position.set(0, y, zN + D); a.rotation.y = Math.PI; base.add(a);
    const px = buildModule(false); px.position.set(D, y, zN); px.rotation.y = -Math.PI / 2; base.add(px);
    const nx = buildModule(false); nx.position.set(-D, y, zN); nx.rotation.y = Math.PI / 2; base.add(nx);
    const bz = D - NODE_ARM - 0.12, s = new THREE.Shape(); s.absarc(0, 0, 0.99, 0, Math.PI * 2); s.holes.push(rrPath(HAB.hatchW + 0.02, HAB.hatchH + 0.02, 0.1));
    const end = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 48 }), M.mMetal); end.position.z = bz; a.add(end);
    hatchH = new THREE.Group(); hatchH.position.set(-HAB.hatchW / 2, 0, bz); a.add(hatchH);
    const lf = mesh(new THREE.ExtrudeGeometry(roundRect(HAB.hatchW, HAB.hatchH, 0.1), { depth: 0.05, bevelEnabled: false }), M.mBox); lf.position.x = HAB.hatchW / 2; hatchH.add(lf);
    a.add(box(3.5, 0.04, HAB.barrelL + 0.2, M.mFloor, 0, fy - 0.02, HAB.coneL + HAB.barrelL / 2)); a.add(box(1.1, 0.04, 1.0, M.mFloor, 0, fy - 0.02, bz - 0.2));
    for (let i = 0; i < 5; i++) a.add(box(0.9, 2.0, 1.15, M.mInner, 1.25, fy + 1.0, 2.9 + i * 1.3));
    a.add(box(1.2, 0.05, 2.2, M.mBox, 0.1, fy + 0.82, 6.4)); a.add(box(0.14, 0.8, 0.14, M.mDark, 0.1, fy + 0.4, 6.4));
    base.add(box(1.1, 0.04, NODE_ARM * 2, M.mFloor, 0, y + fy - 0.02, zN));
    const zA = PORT.z + RP.adapterLength / 2, ad = mesh(new THREE.CylinderGeometry(PORT.r + 0.1, PORT.r + 0.1, RP.adapterLength, 64), M.mDark); ad.rotation.x = Math.PI / 2; ad.position.set(0, y, zA); base.add(ad);
    const cl = []; for (let i = 0; i < 12; i++) { const c = i / 12 * Math.PI * 2; cl.push(place(new THREE.BoxGeometry(0.2, 0.09, 0.2), Math.cos(c) * (PORT.r + 0.12), Math.sin(c) * (PORT.r + 0.12), 0, 0, 0, c + Math.PI / 2)); }
    const cm = mesh(merged(cl), M.mMetal); cm.position.set(0, y, zA); base.add(cm);
    const n = new THREE.Group(); n.position.set(0, y, zN); base.add(n); const hm = M.hMetal;
    n.add(capped(mesh(new THREE.CylinderGeometry(HAB.nodeR, HAB.nodeR, 3.0, 56, 1, true), hm), M.capM)); n.add(capped(mesh(flipped(new THREE.CylinderGeometry(HAB.nodeR - 0.06, HAB.nodeR - 0.06, 3.0, 56, 1, true)), M.hInner), M.capM)); n.add(mesh(new THREE.CylinderGeometry(1.0, HAB.nodeR, 0.4, 56), hm).translateY(1.7));
    n.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.24, 40), hm).translateY(2.02)); n.add(mesh(new THREE.CylinderGeometry(0.72, 0.8, y - 1.5, 32), hm).translateY(-1.5 - (y - 1.5) / 2));
    n.add(mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.14, 40), hm).translateY(-y + 0.07));
    for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { const arm = mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.8, 48), hm), coll = mesh(new THREE.CylinderGeometry(1.14, 1.14, 0.14, 48), hm); arm.rotation.x = Math.PI / 2; coll.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.rotation.y = ry; arm.position.z = 1.7; coll.position.z = 2.05; g.add(arm, coll); n.add(g); }
    for (const [x, z] of [[-17, zN + 25], [16, zN + 31]]) { const tw = new THREE.Group(); tw.position.set(x, 0, z); base.add(tw); tw.add(box(1.8, 0.9, 1.8, M.mBox, 0, 0.45, 0)); tw.add(box(0.34, 16, 0.34, M.arrayF, 0, 8, 0)); for (const k of [-1, 0, 1]) tw.add(box(1.5, 8, 0.05, M.array, k * 1.6, 11.6, 0.3)); } }

  // ------------------------------------------------ SLED75 and crew
  const sled = buildSled(); scene.add(sled.root);
  const parkMid = (VE.wheels.reduce((s, w) => s + w.centre[2], 0)) / VE.wheels.length;   // json wheel stations
  const person = buildPerson(); scene.add(person.root); person.root.visible = false;

  // ------------------------------------------------ lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a988f, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(-34, 42, -26); sun.target.position.set(0, 2, 6); scene.add(sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(opt.shadow || 2048, opt.shadow || 2048); const sc = sun.shadow.camera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.far = 160; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(22, 12, 4); scene.add(fill);
  const lamps = [0.9, 2.6, 4.4].map(z => { const l = new THREE.PointLight(0xfff6e8, 0, 9, 1.6); l.position.set(-0.4, G.ax + 1.55, z); scene.add(l); return l; });
  const lampL = new THREE.PointLight(0xfff6e8, 0, 6, 1.6); lampL.position.set(-0.3, G.ax + 1.3, 6.6); scene.add(lampL);
  const lampM = new THREE.PointLight(0xfff6e8, 0, 16, 1.5); lampM.position.set(-0.5, HAB.axisY + 1.0, zN + 6); scene.add(lampM);

  // ------------------------------------------------ air and dust
  let sd = 3; const rn = () => (sd = (sd * 48271) % 2147483647) / 2147483647;
  const toHopper = (x, z) => { const e = EQ.hopper, zc = Math.min(e.z[1] - 0.2, Math.max(e.z[0] + 0.2, z)); return [v3(x * 0.55, 1.95, Math.min(z, 5.2)), v3(x * 0.25, e.y[1] + 0.02, zc), v3(x * 0.1, e.y[0] + 0.3, zc)]; };
  const pumpPaths = []; for (let i = 0; i < 260; i++) { const x = (rn() * 2 - 1) * 1.5, z = 0.45 + rn() * 4.8, y = 2.5 + rn() * 2.0; pumpPaths.push({ pts: [v3(x, y, z), v3(x, yD + 0.02, z), ...toHopper(x, z)], v: 0.8 + 0.4 * rn(), ph: rn() }); }
  const pump = streaks(scene, pumpPaths, { speed: 1.4, period: 4.2, len: 0.32, opacity: 0.7 });
  const supPaths = []; for (let i = 0; i < 160; i++) { const x = (rn() * 2 - 1) * 0.9, z = 0.6 + rn() * 4.6; supPaths.push({ pts: [v3(x * 0.6, 4.55, z), v3(x, 3.2, z), v3(x * 1.2, yD + 0.02, z), ...toHopper(x * 1.2, z)], v: 0.8 + 0.4 * rn(), ph: rn() }); }
  const supply = streaks(scene, supPaths, { speed: 1.3, period: 4.6, len: 0.3, opacity: 0.6 });
  const dustPaths = []; for (let i = 0; i < 360; i++) { const x = (rn() * 2 - 1) * 0.65, z = 2.2 + rn() * 2.4, y = 2.2 + rn() * 0.75; dustPaths.push({ pts: [v3(x, y, z), v3(x * 1.05, yD - 0.05, z + (rn() - 0.5) * 0.1), ...toHopper(x, z)], v: 0.5 + 0.5 * rn(), ph: rn() }); }
  const dust = streaks(scene, dustPaths, { color: 0x2b2a27, speed: 0.9, period: 4.5, len: 0.12, opacity: 1, points: 0.06 });
  const shPaths = []; for (let i = 0; i < 220; i++) { const s = rn() < 0.5 ? -1 : 1, top = rn() < 0.25, y0 = top ? 4.28 : 2.45 + rn() * 1.5, x0 = top ? (rn() * 2 - 1) * 0.5 : s * 0.72, tx = (rn() * 2 - 1) * 0.15, ty = top ? 3.4 : y0 - 0.25;
    shPaths.push({ pts: [v3(x0, y0, zSh + (rn() - 0.5) * 0.1), v3(tx, ty, zSh + (rn() - 0.5) * 0.2), v3(tx * 2.5, yD + 0.02, zSh + (rn() - 0.5) * 0.4), v3(tx * 2.5, yD - 0.4, zSh)], v: 0.8 + 0.4 * rn(), ph: rn() }); }
  const shower = streaks(scene, shPaths, { speed: 2.4, period: 1.6, len: 0.3, opacity: 0.9, points: 0.035 });
  // Regolith grains knocked off the wheels on the ramp grate, falling in lunar gravity
  const nG = 520, gPos = new Float32Array(nG * 3), grains = [];
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  const gPts = new THREE.Points(gGeo, new THREE.PointsMaterial({ color: 0x3a3936, size: 0.05 })); gPts.frustumCulled = false; scene.add(gPts);

  // ------------------------------------------------ vehicle path
  const zPark = parkMid, zStart = DRIVE.z0;
  function surfY(z) {   // wheel lane surface along z (tracks deployed)
    const zFoot = RA.foot.z, zHead = RA.head.z;
    if (z >= zHead) return yD;
    if (z >= zFoot) return Math.max(bermY(trackX, z), RA.foot.y + (z - zFoot) * (RA.head.y - RA.foot.y) / (zHead - zFoot));
    return bermY(trackX, z);
  }
  // Wheel centre height on a surface: the lowest centre that clears the surface under the tyre
  function wheelY(zc) { let y = -9; for (let k = -12; k <= 12; k++) { const dz = k / 12 * sled.R * 0.98, h = surfY(zc + dz) + Math.sqrt(sled.R ** 2 - dz * dz); if (h > y) y = h; } return y; }
  for (let i = 0; i < nG; i++) {      // pre-seed grains on the ramp section of the drive
    let te = 0, zw = 99, k = 0; while ((zw < RA.foot.z + 0.2 || zw > RA.head.z - 0.1) && k++ < 80) { te = DRIVE.t0 + (DRIVE.t1 - DRIVE.t0) * rn(); const zm = lerp(zStart, zPark, smooth(DRIVE.t0, DRIVE.t1, te)); zw = zm + (rn() < 0.5 ? -1 : 1) * sled.half; }
    grains.push(k >= 80 ? null : { te, x: (rn() < 0.5 ? -1 : 1) * (trackX + (rn() - 0.5) * 0.2), y: surfY(zw) - 0.03, z: zw + (rn() - 0.5) * 0.4, vx: (rn() - 0.5) * 0.2, vz: (rn() - 0.5) * 0.2 });
  }
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 400);
  let st = null, sledInfo = { mid: zStart };

  function apply(t) {
    const s = st = stateAt(t);
    // Door: in-move along +z off the seals, then both rollers ride the track: lift, slide up and park under the crown
    if (s.slide > 0) { const q = leafPose(lerp(sLift, sPark, s.slide)); setLeaf(q.b, q.c); }
    else if (s.lift > 0) { const q = leafPose(lerp(sTop0, sLift, s.lift)); setLeaf(q.b, q.c); }
    else setLeaf([C0[0], C0[1] + G.inMove * s.inMove], [1, 0]);
    for (const b of bolts) b.position.x = b.userData.s * lerp(1.51, 1.665, s.latch);
    lipG.rotation.x = -Math.PI / 2 * (1 - s.lip);
    // Ramp tracks: guide covers open, chains run out from under the deck and lock straight, tail seats, ramp tilts onto the berm
    for (const f of flaps) f.rotation.x = 0.75 * s.mouth;
    placeChain(lerp(chain.sTailIn, chain.sTailOut, s.tSlide), s.tTip);
    // SLED75: reverses in, tiller first, with the loader in carry; loader lowers to the park pose at the stop
    const zm = lerp(zStart, zPark, s.drive); sledInfo.mid = zm;
    const yF = wheelY(zm - sled.half), yR = wheelY(zm + sled.half);       // loader-side wheels at -z, tiller-side at +z
    sled.root.position.set(0, (yF + yR) / 2 - sled.R, zm); sled.root.rotation.set(Math.atan2(yR - yF, 2 * sled.half), Math.PI, 0);
    sled.setSpin(-(zm - zStart) / sled.R);
    const pc = LOADER_POSES.carry, pp = LOADER_POSES.park; sled.pose(lerp(pc.a, pp.a, s.loaderPark), lerp(pc.b, pp.b, s.loaderPark));
    // Grains
    gPts.visible = t > DRIVE.t0 && t < DRIVE.t1 + 3;
    if (gPts.visible) { for (let i = 0; i < nG; i++) { const d = grains[i]; let x = 0, y = -5, z = 0; if (d) { const a = t - d.te; if (a >= 0) { y = d.y - 0.81 * a * a; if (y > 0.02) { x = d.x + d.vx * a; z = d.z + d.vz * a; } else y = -5; } } gPos[i * 3] = x; gPos[i * 3 + 1] = y; gPos[i * 3 + 2] = z; } gGeo.attributes.position.needsUpdate = true; }
    // Cutaways and lights
    clipX.constant = s.cut > 0.001 ? lerp(G.Ro + 0.15, CUT, s.cut) : 40;
    clipM.constant = s.cutM > 0.001 ? lerp(HAB.R + 0.2, CUTM, s.cutM) : 40;
    lamps.forEach(l => { l.intensity = 7 * s.cut + 2.5 * s.slide; }); lampL.intensity = 5 * s.cut; lampM.intensity = 7 * s.cutM; fill.intensity = lerp(0.5, 0.95, Math.max(s.cut, s.cutM));
    pump.update(t, s.pump); supply.update(t, Math.max(s.repress, 0.5 * s.down)); dust.update(t, s.down); shower.update(t, s.shower);
    // Hatches and crew
    hatchH.rotation.y = s.hatchH * 1.7; hatchB.rotation.y = s.hatchB * 1.7; hatchA.rotation.y = -s.hatchA * 1.7;
    crew(t);
    const c = cameraAt(t); camera.position.set(...c.p); camera.lookAt(...c.c); if (camera.fov !== c.f) { camera.fov = c.f; camera.updateProjectionMatrix(); }
    return s;
  }
  // Crew path: habitat, habitat hatch, node, Hatch B, lock and shower, Hatch A, shop
  const yH = HAB.axisY - HAB.hatchH / 2, zHH = zN + D - (D - NODE_ARM - 0.12), workZ = zPark + 1.331 + 0.36;
  const WP = [[65.0, -0.25, yH, zN + 7.2], [67.3, 0, yH, zHH + 0.7], [68.4, 0, yH, zHH + 0.7], [71.0, 0, yH, PORT.z + 0.45], [72.0, 0, yH, PORT.z + 0.45],
    [73.4, 0, yD, zSh + 0.05], [77.8, 0, yD, zSh + 0.05], [79.0, 0, yD, G.bulkApex - 0.5], [80.2, 0.1, yD, workZ], [84.4, 0.1, yD, workZ]];
  const ducks = [zHH, PORT.z - 0.1, G.bulkApex + 0.05];   // workZ: standing 0.36 m behind the tiller (CAD rear 1.331 m behind mid-wheelbase)
  function crew(t) {
    const R = person.root; R.visible = t > WP[0][0] - 0.01 && t < 84.6; if (!R.visible) return;
    let k = 0; while (k < WP.length - 2 && t > WP[k + 1][0]) k++;
    const a = WP[k], b = WP[k + 1], f = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))), moving = Math.hypot(b[1] - a[1], b[3] - a[3]) > 1e-3 && f > 0 && f < 1;
    const x = lerp(a[1], b[1], f), z = lerp(a[3], b[3], f);
    const yy = z > PORT.z - 0.15 ? yH : z > G.bulkApex + 0.08 && z < PORT.z - 0.15 ? yD : z < G.bulkApex - 0.08 ? yD : G.hatchSill;
    R.position.set(x, yy, z);
    if (moving) R.rotation.y = Math.atan2(b[1] - a[1], b[3] - a[3]);
    const duck = Math.max(...ducks.map(zd => 1 - smooth(0.25, 0.6, Math.abs(z - zd)))), work = smooth(80.2, 81.0, t);
    person.set({ walk: moving ? 1 : 0, phase: (t * 7.5) % (Math.PI * 2), duck, work: work * (0.9 + 0.1 * Math.sin(t * 2.2)) });
    if (work > 0) R.rotation.y = Math.PI;
  }
  const projV = new THREE.Vector3();
  const api = {
    sledAt: (h = 1.2) => [0, sled.root.position.y + h, sledInfo.mid],
    trackAt: () => { const m = tracks[0].segs[3]; m.updateMatrixWorld(); const v = new THREE.Vector3(0, 0.1, 0.27).applyMatrix4(m.matrixWorld); return v.toArray(); },
    leafAt: (u = 0.95, x = 0, outer = false) => { leafG.updateMatrixWorld(); return new THREE.Vector3(-x, u, outer ? wOut(u) : wIn(u)).applyMatrix4(leafG.matrixWorld).toArray(); },
    sealZ,
  };
  function labels(t, W, H) {
    const out = [], k = W / 1280; camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    for (const q of LABELS) {
      if (t < q.t0 || t > q.t1) continue;
      projV.set(...q.at(api)).project(camera); if (projV.z > 1) continue;
      out.push({ text: q.text, x: (projV.x + 1) / 2 * W, y: (1 - projV.y) / 2 * H, lx: (projV.x + 1) / 2 * W + q.d[0] * k, ly: (1 - projV.y) / 2 * H + q.d[1] * k, a: Math.min(smooth(q.t0, q.t0 + 0.4, t), 1 - smooth(q.t1 - 0.3, q.t1, t)) });
    }
    return out;
  }
  // Handles: hingeG is kept as an alias of leafG (the door no longer hinges); follow is empty (no follower floors any more).
  return { scene, camera, apply, labels, clipX, clipM, M, G, sled, person, lamps, leafG, hingeG: leafG, tracks, state: () => st, surfY, wheelY, api, base, tracksG: tracks, follow: [], flaps, lipG, bolts, chain, leafPose };
}

export function drawLabels(ctx, list, W, H, scale = 1) {
  ctx.save(); ctx.font = '600 ' + (14 * scale) + 'px Segoe UI, Arial, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  for (const q of list) {
    const tw = ctx.measureText(q.text).width, pad = 7 * scale, h = 24 * scale, lx = Math.min(W - tw - pad * 2 - 6, Math.max(6, q.lx)), ly = Math.min(H - 70 * scale, Math.max(h, q.ly));
    ctx.globalAlpha = q.a; ctx.strokeStyle = '#1d1d1b'; ctx.lineWidth = 1.4 * scale; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(lx + (lx < q.x ? tw + pad * 2 : 0), ly); ctx.stroke();
    ctx.fillStyle = '#1d1d1b'; ctx.beginPath(); ctx.arc(q.x, q.y, 3.5 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.94)'; ctx.fillRect(lx, ly - h / 2, tw + pad * 2, h); ctx.strokeRect(lx, ly - h / 2, tw + pad * 2, h);
    ctx.fillStyle = '#1d1d1b'; ctx.fillText(q.text, lx + pad, ly + 1);
  }
  ctx.restore();
}

// Caption bar, credits and progress line, shared by the film and the stills. Plain text, no slogans.
export const CREDITS = ['G-3 garage concept for SLED75-class rovers. Not to time scale.', "Habitats and node after NASA's Moon Base concept, sizes scaled. SLED75 from SpaceDIRT CAD (simple placeholder shapes in public builds)."];
export function drawOverlay(ctx, S, t, W, H, opt = {}) {
  if (opt.labels !== false) drawLabels(ctx, S.labels(t, W, H), W, H, W / 1280);
  const k = W / 1280, bh = 54 * k, FONT = 'Segoe UI, Arial, sans-serif';
  const step = STEPS.find(q => t >= q.t0 && t < q.t1) || STEPS[STEPS.length - 1], i = STEPS.indexOf(step);
  ctx.save(); ctx.fillStyle = 'rgba(29,29,27,0.78)'; ctx.fillRect(0, H - bh, W, bh);
  ctx.fillStyle = '#fff'; ctx.font = `600 ${21 * k}px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(`${i + 1}. ${step.label}`, 24 * k, H - bh / 2);
  ctx.font = `${12 * k}px ${FONT}`; ctx.textAlign = 'right'; ctx.fillStyle = '#d8d6cd';
  ctx.fillText(CREDITS[0], W - 22 * k, H - 37 * k); ctx.fillText(CREDITS[1], W - 22 * k, H - 17 * k);
  ctx.fillStyle = '#b4472a'; ctx.fillRect(0, H - bh - 3 * k, W * t / T_END, 3 * k); ctx.restore();
}
