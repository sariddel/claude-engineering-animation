# Pipeline

## 1. Sizing to a geometry JSON

The design lives in a plain Node sizing script, not in the 3D scene.

- Every input carries low, nominal and high values, a unit, a source and a status: public, own data, or assumption.
- The script computes geometry, loads, masses, gas, centre of mass and clearances. It writes a markdown results file with hand checks: about 36 numbers are recomputed by hand in the file and must agree within 1%. It also writes figures as SVG and PNG.
- Running it twice must give a byte-identical results file. Claude reruns it before reporting any number to Shaun.
- It also writes `G-3_geometry.json`, in the scene's axes: x across, y up, z along the bore, the seal plane at z = 0, +z into the bay, the ground at y = 0, all in metres. The file holds:
  - the vessel, deck, opening and frame;
  - the leaf: curvature, rollers, track centrelines as point lists, and its poses (closed, moved in, lifted, stations along the track, parked);
  - the swept envelope, nose stop, dust lock, rear port, legs, berm and ramp;
  - the equipment boxes and the vehicle envelope;
  - notes.

The JSON is the contract between the two agents. The sizing agent may change it; the scene agent may not. If the scene can't be drawn as the JSON says, the scene agent reports why and the sizing is fixed. The ramp chain is an example: the JSON's channel had no room for a rigid track, so the track became nine hinged segments.

## 2. Scene

`scene/scene.js` exports:

| Export | What it does |
|---|---|
| `loadAssets()` | Loads the optional wordmark font. Call it before `buildScene`. |
| `buildScene({ shadow, bg, labels })` | Returns `{ scene, camera, apply(t), labels, clipX, clipM, M, G, sled, person, lamps, leafG, flaps, chain, ... }` |
| `stateAt(t)`, `cameraAt(t)` | Every moving part and the camera at film time t |
| `STEPS`, `T_END` | Captions and their times; T_END = 89 s |
| `drawOverlay(ctx, S, t, W, H)` | Caption bar, part labels and footer, drawn in 2D over the WebGL frame. Skip it for a clean picture. |

Rules the scene keeps:
- Every dimension comes from the JSON. The scene owns only timing, camera and what is drawn beyond the JSON, and those extras are listed in its header as proposals.
- Cutaways are clipping planes, with the cut faces capped so walls read as solid sections.
- Labels carry a number only if that number is in the sizing results.
- The livery has separate mark and wordmark functions, so swapping the logo means a re-render, not a rebuild.

## 3. Frames

```
node tools/build.mjs scene/film_entry.js tools/film.bundle.js
node tools/frames.cjs frames 25 89
```

- `frames.cjs` opens `tools/film.html` in headless Edge with SwiftShader WebGL: `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- For each frame it calls `window.frameAt(t)` and writes `frames/f00000.jpg` onward.
- It skips frames already on disk, so a stopped render resumes where it stopped.
- It relaunches the browser after a crash, and gives up if the browser is lost more than 3 times in 10 minutes.
- Speed on a laptop CPU: about 100 frames a minute at 1280 x 720.

`film_entry.js` reads `?w=&h=&fps=&clean=1` from the page URL. `clean=1` skips the overlay, which is how the web version was made.

## 4. Encode

```
node tools/build.mjs tools/encode_entry.js tools/encode.bundle.js
node tools/encode.cjs frames G3_sequence.mp4 2225
```

The browser's `VideoEncoder` does the work: `avc1.640028` (H.264 High) at 3.5 Mbit/s, with a keyframe every 2 s. `mp4-muxer` writes it with fastStart, so the moov box comes before mdat and there is no metadata box. No ffmpeg is needed.

## 5. Contact sheet and checks

```
node tools/contact.cjs frames G3_sequence_frames.png 3 640 4,13,17,21,27,33,37.1,42,47,58,70,83
```

It is pure Node (jpeg-js and pngjs), so no browser is needed. After every render Claude reads the contact sheet, plus about 8 frames decoded from the final MP4, and checks four things:
- captions match the action;
- no parts pass through each other;
- the moving door clears the vehicle and the crown;
- labels don't clash.

The hand-back lists every open issue it finds.

## 6. Viewer

```
node tools/build.mjs scene/viewer_entry.js tools/viewer.bundle.js
node tools/mkview.cjs scene/tmpl.html tools/viewer.bundle.js G3_viewer.html
```

The result is one self-contained HTML file with play, scrub, step list and orbit when paused.

## Shared laptop etiquette

Several Claude sessions share one laptop, and Shaun uses Edge for his own work:
- **One heavy render at a time.** Before starting a long frame render, check that no other session's render is running. A small background watcher can wait for another session's queue to finish.
- **Stop only your own processes,** by PID. Never end Edge by name: that kills the user's browser.
- **When the user asks for a pause** (for example during a large file transfer in his browser), stop your render cleanly, note the frame, and resume from that frame later.
- **Never overwrite a delivered film.** New versions get new file names, and a protected copy of the delivered set is kept.
