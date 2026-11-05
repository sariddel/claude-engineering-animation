# Prompts

Shaun's messages are quoted exactly, typos included. `[...]` marks a cut and `[ ]` marks a word replaced. The only cuts are programme-restricted details: agency, contract and vehicle-class references. Agent briefs are condensed from the originals with the same cuts.

## Shaun's direction, in order (5 November 2026)

Before this day, an earlier and larger garage concept (G-1) had set the base layout. These are his directions from that round that carried into G-3:

> "I dont want a mobile unit, just the regular hab", "direct connect", "sit level with the other moon base modules", "get rid of the ramp and replace it with a regolith berm", "have the internal ramp extend and deploy down", "match the moon base cradle designs", "more frequent legs"

> Ramp tracks as an open bar grate, "so that regolith can be knocked off".

> On the gas system: "too detailed but not well enough... a negative".

> "that first entry from the hab to the garage should always be sealed after use, then the blow down shower area and then access to the dirty shop environment.. and then same on exit.. [...] dust control inside the shop, make a filtration system similar to paint booth where everytime air is pumped out of the shop its pulled down through the floor so all regolith ends up below the floor and then can be vacuuumed up and released"

> "sizing is a lever, not a constraint"

> "the whole point of being on the moon is to interact with the moon"

### G-3, the smaller garage

After a discussion of how airliner doors are built and sealed:

> "I want to update to the aircraft door, internal mount, in a smaller garage, sized to fit the SLED75 size rovers, [...] and then remove the [agency] logo from side, make it a spacedirt logo."

> "can you put the existing render side by side with a still of G3S I cant understand the size"

> "is G3S same size as the other lunar hab modules?"

> "lets use 4.2m diameter, and then have the door swing in and up to the roof (like some airplanes?) and go ahead with full rebuild of our animation, everything re-geared towards this.. Make the door as wide as possible"

> Logo: "three star and word makr"

### The door correction

> "BIG PROBLEM, the door opens on a hinge.. I was expecting it to come in, then slide upwards, kinda like a solid garage door, because otherwise, you lose that payload area"

> "it should also be curved I believe for the tension load and also for conenience when sliding upwards"

Asked whether he meant an end door or a side door, he picked: **End door, curved.**

> "research different airplane door architectures, are there any that go up?  Should we put the door in the side of the tube???????????"

> "give me a quick twenty second read on using the door on the end vs side?"

> "15 psi doens't seem like that much?"

> "okay lets keep the end design for now then"

### The film

> "pay attention to the cutaway views on teh render, maybe we don't need the cutaway on the drive in, but only to show inside and then person walking across.. see if you can get it a bit shorter"

> "don't overwrite this one"

> On another scene: "we will need to show tiller ahead of the loader in the trenches"

### Process

> "can you pause all edge processes for 45 min, I keep ending them anyways, let the file transfer finish"

> "Can you document how you are doing the animations and prompts to date in a public github on sariddel that I can share with my friend" and "also include the latest render"

## Agent briefs (condensed)

### 1. Sizing agent: G-3 trial (smaller garage, plug door)

Goal: a first-order sizing of a smaller pressurized garage with an aircraft-style plug door: mounted inside, bigger than its opening, held shut by pressure. Two design vehicles: SLED75 (from SpaceDIRT CAD: footprint 1.203 x 1.001 m, tyre about 0.52 to 0.57 m, top of mast about 1.55 m in the envelope) and one larger class as a check.

Key points:
- Copy the existing sizing script into a new folder and change it only where the variant differs. Never touch the older design's files.
- Use a spacecraft-grade double seal with a monitored gap between the seals, not an aircraft seal. An airliner's whole fuselage may leak like a hole the size of a coin.
- Report: the door opening, leaf and frame; force at operating pressure and at maximum design pressure; seal length and leak; mass in low, nominal and high bands at 20% growth; free volume and gas; centre of mass; and lander class from public data.
- Include hand checks. The results must reproduce byte for byte. Tag every input public, own data or assumption.
- Rules: first order, no invented data, no restricted inputs in the public variant, generic web requests, attribution, prose with no dashes.

### 2. Sizing agent: G-3 baseline at 4.2 m

Shaun's message quoted in full. The geometry decisions sent with it, flagged as the main session's calls:
- OD 4.2 m to match the habitats; axis 3.0 m above ground, the same as the habitats; rear port on the axis.
- Opening centred on the axis for the widest door: 1.70 m high, width as wide as the frame rules allow. The hand number was 2 x (sqrt(1.95^2 - 1.05^2) - 0.20) = 2.886 m.
- Separate dust lock with a shower. Berm and ramp tracks at about 10 to 12 degrees.

A new output was asked for: `G-3_geometry.json`, the single source for the scene, written as early as possible.

### 3. Scene agent: rebuild the film for G-3

- Back up the old scene first. Every dimension comes from `G-3_geometry.json`, with provisional values until it exists.
- SLED75 from SpaceDIRT's CAD, looking like the real machine (real photos given as reference). No blocky envelopes: Shaun rejects "bad sketches" and wants "professional grade".
- Suggested film beats: establishing view, pump-down with downdraft, latches, door motion, bridge lip and ramp tracks, the SLED driving in, closing and repressurizing, dust removal, crew from the habitat through the shower, shirtsleeve work.
- Captions in plain short sentences; monochrome with one accent; numbers only if they are in the sizing results.
- Outputs: film, viewer, contact sheet, hero stills. Don't render the full film until the main session sends "geometry final".
- Checks: no parts passing through each other, the leaf clears the mast, wheels sit on the ramp, labels don't clash, the logo reads correctly, captions match. List every open issue.

### 4. Both agents: the door correction

Shaun's two messages quoted in full. The new door:
- one solid leaf, curved about the cross-axis, bulging out about 0.1 m so pressure puts it in tension;
- it moves in off its seals, lifts, then rides rollers in two side tracks (vertical, bend, horizontal) and parks convex side up under the roof;
- no swing arc, so the vehicle stops closer to the door and the freed floor becomes payload space at the same vessel length.

The sizing agent was asked for:
- the curvature trade (membrane force p x R, skin, edge thrust into the frame);
- the track geometry;
- the swept envelope, which on straight guides would trace an astroid;
- the new nose stop;
- the reclaimed floor.

The scene agent was asked to plan, then wait for the final JSON.

### 5. Scene agent: the new cut

Shaun's message quoted in full:
- About 85 to 95 s.
- No cutaway from the start through the door closing; show the door's in, lift and slide-up from outside, through the opening.
- Cutaways only for the inside reveal and for the crew walk. Cut faces capped, no parts vanishing.
- Six test stills before the full render.

### 6. Scene agent: clean web cut

A clean picture with no captions, labels or footer, at 1920 x 1080, 30 fps, H.264, yuv420p, faststart. A 45 to 60 s loop:
- door opening, the SLED backing up the ramp, the door closing;
- the downdraft, the crew through the hatch;
- a closed shot that matches the first frame.

Plus a poster JPG and new file names only. It renders only after other sessions' heavy jobs finish.
