# Chat log, G-3 garage and animation (5 November 2026)

Shaun's messages and Claude's replies from this Claude Code session, from the first question about airlock doors through the G-3 design, renders, the animation and this repository. Tool calls, tool output and messages between agents and other sessions are left out. Lines that carried restricted programme details, earlier design versions, other projects or business matters were removed and the removal is marked. Text is otherwise as written, typos included.

**Shaun:** what is the difference between a large door and small door on an airlock? Is it massive?

**Claude:**

**No, the large door isn't massive. A 5 m vehicle door weighs about 15 times a 1 m hatch, for about 20 times the opening area, so the weight per square metre is about the same. What grows is the force on the door, the seal length and the risk if it fails.**

**What does get big:**
3. **Gas per cycle.** A big door means a big bay to pump down every time it opens. That gas loss, not the door, is what drives the garage's running cost.

*[14 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** I see, and what about an aircraft style door (also what pressure would aircraft door be holding)

**Claude:**

**Pressure.** The FAA rule (14 CFR 25.841) caps an airliner's cabin pressure at the equivalent of 8,000 ft. Working that through the standard atmosphere:

| Case | Inside | Outside | Pressure difference |
|---|---|---|---|
| Airliner, 8,000 ft cabin at 41,000 ft | 75.3 kPa | 17.9 kPa | **57 kPa (8.3 psi)** |
| Newer-jet style, 6,000 ft cabin at 43,000 ft | 81.2 kPa | 16.2 kPa | **65 kPa (9.4 psi)** |
| Lunar garage, habitat standard | 56.5 kPa | vacuum | **56.5 kPa (8.2 psi)** |
| Lunar garage at sea-level pressure (ISS style) | 101 kPa | vacuum | 101 kPa (14.7 psi), 1.8 times an airliner |

These are my calculations from the rule, not published values for any one aircraft. The research notes have no checked figure for a specific type.

**The two aircraft door styles**

1. **Plug door (passenger doors).** The door is bigger than the hole and sits inside it, so cabin pressure pushes it onto stops in the frame. At 57 kPa a 1 × 1.9 m door has about 110 kN (11 tonnes) on it and cannot open in flight. If the latches fail, it still stays shut. To open it on the ground, the door lifts or folds slightly so it can pass out through its own opening.
2. **Cargo door (outward, latched).** Pressure pushes the door open, and the latches carry the whole load. That is the class that failed on United 811 (1989) and the C-5 (1975), and why 14 CFR 25.783 now requires individually locked latches and no pressurization unless the door is locked. The 747-8F side cargo door (3.05 × 3.40 m) would carry 0.59 MN at 57 kPa.

The masses are equal because the plug saves the heavy locking ring but needs a heavy frame. A rectangular opening concentrates load at its corners, which a round door avoids.

The plug door costs room and reach. It swings 3.1 m into the bay as it closes, so the vehicle has to stop that much further in, and the crew lock moves up to the roof. The opening also loses the largest vehicle class.

**What doesn't carry over from aircraft**
- **Leakage.** An airliner pumps outside air in all the time and lets it out through a valve, so its door seals only need to be good enough. On the Moon every kilogram of gas that leaks is landed mass, so the seal has to be tight.
- **Dust.** Aircraft door seals never see regolith. NASA's dust tests on seals stop at 30 cm, and no seal of this size has been tested.
- **Cycles.** An aircraft door is designed and tested for one pressurization a flight. No cycle-life figure exists for a large door in dust and cold.

**My view:** the plug door is the better door for crew in shirtsleeves, because a latch failure doesn't throw the door out. Going that way trades away interior length and the largest vehicle class, not mass. The pressure numbers are derived as shown above. The door masses come from `design\sizing_results.md` (section 2 and the option E note), and the aircraft door data from `research_notes\...\garage_precedents_and_doors.md`. Aircraft door masses aren't public.

*[11 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** how good is the seal on the airplane doors? good enough for space?

**Claude:**

**No, airliner door seals aren't close to good enough for space. An airliner is built to leak: compressors pump outside air in all the time and a valve lets it out, so the cabin only has to stay pressurized. On the Moon every kilogram of air that leaks has to be landed, so the seal has to be thousands of times tighter.**

**How leaky an airliner is allowed to be.** Boeing pressure-tests every new aircraft on the ground. The whole fuselage may leak no more than "a hole equivalent in size to a U.S. quarter", about 24 mm across, and "the primary leakage paths on all airplanes are the passenger entry doors" (Lazar, Boeing, CMSC Journal 2015). A Boeing patent adds that fuselage leakage grows with age "primarily due to an increase in door seal leakage". The seals are flexible fabric-reinforced rubber that pressure pushes into place. No source I found gives an airliner leak rate in kg per day.

**Side by side, as an equivalent hole.** The holes are my conversion of each leak rate to one sharp hole leaking into vacuum at 20 °C. Real small leaks don't behave like a single hole, so this is only for scale.

**A quarter-sized leak on the garage.** At 56.5 kPa the bay would lose 3 to 5 tonnes of air a day. It only holds 102 kg, so half of it would be gone in 20 to 30 minutes. The garage's allowance is 0.11 kg/day, which is 30,000 to 50,000 times tighter.

**What does carry over.** The door shape and the pressure carry over. Only the seal has to change.
- **The weak moment is the start of the fill.** Before pressure builds there's no seating force. Latches or an inflatable seal have to seat it first. The FAA rule draws the same line at half a psi.
- **The seal itself would be space practice.** That means a double seal with the gap between the seals monitored for leaks, as on the AP1000 reactor hatch and NASA's Space Power Facility doors, with silicone O-rings or bulb seals on clean metal faces. The open problem is still keeping dust off 14 to 16 m of seal.
- **Cleaning is not solved.** NASA's tests found a microfiber wipe restored dusty seals, while brushes and compressed air did not. Nothing has been tested at this size, in vacuum and cold together.

Sources:
- [Lazar, "Photogrammetry Measurements of Airplane Passenger Entry Doors", Journal of the CMSC, Autumn 2015 (Boeing)](https://geodetic.com/wp-content/uploads/2018/08/CMSC_2015_LAZAR_PAPER.pdf)
- [US7837541B2, Method for reducing outside air inflow required for aircraft cabin air quality (Boeing)](https://patents.google.com/patent/US7837541)
- [US10755493B2, Method for fuselage leak monitoring and detection](https://patents.google.com/patent/US10755493)
- [Schaezler et al. 2011, ISS leakage trend](https://ntrs.nasa.gov/citations/20110012997)
- [NASA TM-20230015308, dust on docking and hatch seals](https://ntrs.nasa.gov/citations/20230015308)

*[10 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** I want to update to the aircraft door, internal mount, in a smaller garage, sized to fit the SLED75 size rovers [...] and then remove the [agency] logo from side, make it a spacedirt logo.

**Claude:**

Now the livery. Reading the scene's livery code.

I've swapped the logo. The G-3 sizing (the smaller garage with the aircraft-style door) is still running in a separate agent, and I'll check its numbers before bringing them to you.

- **The mark is a stand-in.** The website's own notes call its three-star logo "a local SVG recreation", to be replaced with the official artwork. The only official file I found is `86-LOGO.SLDPRT`, a SolidWorks part. If you have the vector logo, send it and I'll swap it in.
- The old scene is backed up as `design\animation\old\scene before SpaceDIRT livery.js`.

Each case gets the door opening and swing, door force, seal length, mass at 20% growth, gas per fill, centre of mass, and the lander class it needs. The question I most want answered is whether a SLED-sized garage fits a commercial lander instead of a 15 t cargo lander.

When it's done I'll send the numbers with a recommendation. Putting G-3 into the report, figures and film waits on your go after that.

Checking the agent's work against disk: re-running the script and hand-checking the key numbers.

**Why G-3S is still 8 t.**
- **The door is only 10% of it.** The shell, insulation and micrometeoroid shielding, deck and legs make up half, and those scale with surface area.
- **The rover is a small part of the length.** The door's swing, a walking aisle and the dust lock add 4.8 m to a 2.4 m rover.
- **The diameter is set by crew room, not the door:** 1 m clear beside the rover at shoulder height. The door alone would fit a 3.0 m diameter.
- **It doesn't fit any commercial lander.** Every lander flown or near term carries 3 t or less, and 8 t matches only NASA's planned growth target for small landers, which has no hardware. Otherwise it rides on a 12 to 15 t cargo lander and leaves about 7 t for the rovers.
- **2.3 t of it is placeholder allowance with no data behind it.** The power and thermal line is probably high by a few hundred kg.

**Door choice (the agent's proposal).**
- **Side hinge on G-3S:** it gives a shorter bay, carries no weight as it swings, and stays put if its drive fails.
- **Threshold:** the floor is flush at the door, and a bridge plate covers the seal channel, so wheels never roll over a seal.
- **Seating:** pressure alone holds the door closed above about 8 kPa, and latches seat it below that.

Decisions for you:
2. **Separate dust lock, or the bay as the airlock?** I recommend the bay as the airlock if the garage always docks to a habitat node. It saves 0.67 t and 0.65 m, and keeps your sequence: the hab hatch sealed after every use, then a shower cell, then the dirty shop.
3. **Is about 7 to 8 t acceptable?** If you want it on a 3 t commercial lander, it needs a different construction, likely inflatable, which I haven't sized.

Once you pick, the next phase is the report, figures, 3D model and film for G-3, all with the new logo. Results and figures are in `design\G-3\`; the main ones are `G-3_results.md` and `figures\G3S_side.png`.

*[21 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** do you have a recent I could look at?

**Claude:**

I've opened the three newest images on your screen. There's no 3D render of the new garage yet.

1. **`G3S_side.png`**, the side section of G-3S. It shows the SLED75 with loader and tiller in the bay, the side-hinged plug door seated on its frame, the door parked against the wall, the dust lock, and the rear port. It's 3.6 m in diameter and 7.66 m long.
2. **`G3S_end.png`**, the end view at the door. It shows the 1.56 × 1.70 m opening, the door leaf, the rover's outline, and a 1.9 m person beside it for scale.

I can make a quick 3D still of G-3S with the SpaceDIRT livery: the SLED in the bay and the door swung open, a couple of camera angles. I'd build it as a separate copy of the scene so the film isn't touched before you pick a baseline. Want me to?

*[2 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** can you put the existing render side by side with a still of G3S I cant understand the size

**Shaun (while Claude was working):** is G3S same size as the other lunar hab modules?

**Claude:**

**G-3S is close to the size of a habitat module, slightly slimmer and shorter. In the 3D model it looks like a smaller sibling of the habitats rather than the big drum the old garage was.** I've opened three side-by-side images on your screen. Each pairs the existing render (left) with G-3S on the same node arm (right), from the same camera at the same scale. A SLED75 and a 1.8 m person stand at each door as a yardstick.

- **3/4 view:** G-3S tucks in among the habitats instead of towering over them. The SpaceDIRT logo is on its side.
- **Side view:** shows the heights best. G-3S sits just under the end of the habitat module beside it.
- **From above:** G-3S is narrower than the habitat modules and a bit shorter.

**Where the sizes come from:**
- **Habitat module:** NASA has only published "over 100 m³". The 4.2 × 9.4 m is our scaling from NASA's Moon Base slides, the same as in the existing render.
- **G-3S is a quick model** built from the sizing numbers in my scratch folder, and the film isn't touched. The SLED75's loader and tiller are drawn as plain blocks at their measured sizes.

The images are in `design\G-3\renders\`.

*[8 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** oh perfect, okay got it, lets use 4.2m diameter, and then have the door swing in and up to the roof (like some airplanes?) and go ahead with full rebuild of our animation, everything re-geared towards this.. Make the door as wide as possible

**Claude:**

Starting the full rebuild with your settings:
- **Diameter:** 4.2 m outside, the same as the habitat modules.
- **Door:** an inward plug door, hinged at the top, that swings in and up to stow under the roof.
- **Door width:** as wide as the 4.2 m hull allows.

The sizing agent already knows its script, so I'm handing it the 4.2 m update. A second agent starts rebuilding the animation in parallel.

The rebuild is running in two parts. The sizing is being re-run at 4.2 m, and the animation is being rebuilt around it. I'll check both against disk before showing you anything.

**Geometry I've set (my calls, tell me if any are wrong):**
- **Hull:** 4.2 m outside, 4.0 m inside. The centreline is 3.0 m off the ground, the same as the habitat modules, so the rear port mates to the node arm the same way a habitat does.
- **Door width:** about 2.9 m wide by 1.7 m high. Centring the opening on the hull's centreline gives the widest door a round hull allows. That's 1.85 times the width of the G-3S door, and wide enough for rovers up to about 2.6 m across.
- **Door motion:** it's hinged at the top. It moves in off its seals, then swings in and up to lie flat under the roof. There's about 1.8 m of headroom under it at the front of the bay, enough for the SLED's mast but low for a standing person in that first 2 m. The sizing run checks whether a raised (offset) hinge can lift it higher.
- **Floor:** 2.15 m above ground, flush with the door sill. The regolith ramp outside goes to about 1.3 m so the ramp tracks stay near 10°.
- **Dust lock:** I've kept the separate lock with the shower, matching your sequence of hab hatch sealed, then shower, then shop. You haven't picked between that and using the bay as the airlock yet. The bay-as-airlock version gets reported alongside.

The garage's wordmark was in the wrong font, so I'm fixing it now, and I need you to choose which logo goes on the garage.

**Which logo?** I found your logo file, `Pictures\Spacedirt new feb 14.png` (Feb 2022). It's a crater-rim arc with a single four-point star over SPACEDIRT. The website and your sensor-mast cut-outs use a different mark: three four-point stars. Which should go on the side of the garage?
1. Three-star mark + SPACEDIRT (what's in the rebuild now)
2. The crater logo from the Feb 2022 file
3. SPACEDIRT wordmark only

If you have the logo as a vector file (SVG, AI, PDF or EPS), point me to it and I'll use that instead of a redrawn copy.

The G-3 geometry is settled, and the animation is being rebuilt to it now. I'll render the full film after the final mass run confirms the numbers.

| | G-3 |
|---|---|
| Hull | 4.2 m outside, 4.0 m inside, 7.76 m long |
| Centreline height | 3.0 m off the ground, same as the habitat modules |
| Floor | 2.15 m off the ground, flush with the door sill |
| Door opening | **2.88 m wide** × 1.70 m high |
| Door panel | 3.08 × 1.90 m, 0.17 m thick, hinged at the top |
| Door stowed under the roof | 1.75 m clear above the floor; 0.15 m spare each side |
| Rover stop | 2.19 m inside the door |
| Regolith ramp outside | 1.3 m high; the 4.8 m ramp tracks sit at 10° |

**One change to the door motion:** it now moves in 5 cm off its seals, lifts 12 cm, then swings in and up to the roof. Without the lift, the bottom edge would swing 0.84 m under the floor and need a slot about 1.2 m wide across the threshold. With the lift that slot is 0.32 m, and a bridge plate covers it whenever the door is open.

**Headroom at the front of the bay:** with the door stowed there's 1.75 m above the floor for the first 2 m inside the door. The SLED's mast clears it by 0.2 m. A person would have to duck there; the rest of the bay has full headroom.

When both parts are done I'll check the film frames and stills, then send you the film, the 3D viewer and the stills. I still need your answer on the logo: the three-star mark, the crater logo, or the wordmark only.

The G-3 sizing is final. I re-ran it, got identical results, and hand-checked the door numbers. The animation is now rendering against it.

- **Lander:** 9.2 t is more than the 8 t growth target for small landers. It would ride on a 12 to 15 t cargo lander, leaving about 5.8 t for other cargo.
- **Door headroom isn't a crew problem.** The door only opens with the bay at vacuum, so nobody stands under it in shirtsleeves. A raised hinge would have bought only 0.14 m, so the plain top hinge stays.

**One check that could make it about 1 m shorter and 0.7 t lighter.** The rover's stopping point currently assumes a box drawn around the whole SLED, mast included. The actual SLED shape would let it stop 1 m closer to the door. That hinges on where the mast sits on the rover, and the mast position in the model is a drawing value, not from your CAD. Can you confirm where the SLED75 mast sits, front to back? If it's near the middle or back of the rover, G-3 drops to about 6.8 m long.

I still need your logo pick: the three-star mark, the crater logo, or the wordmark only. The rebuild uses the three-star mark until you say otherwise.

*[12 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** three star and word makr

**Claude:**

Got it: the three-star mark plus the SPACEDIRT wordmark in your logo's font. The rebuild already uses that, so nothing changes.

The film is still being built. When it's done I'll check the frames and send you the film, the 3D viewer and the stills.

The mast position question is still open. If you can tell me where the SLED75 mast sits front to back, the garage could get about 1 m shorter.

---

**Shaun:** are you using edge? if so can you wait until file transfer completes? are you using edge? if so can you wait until file transfer completes?

**Claude:**

Yes. The film is rendered in a hidden background copy of Edge. I've stopped it and paused all rendering until you tell me your transfer is done.

- **Your Edge wasn't touched.** I ended only the hidden copy the render started, by its process ID, and checked afterwards that your Edge window, running since yesterday, is still up.
- **No more Edge until you say so.** I've told the agent building the animation not to start Edge again, and never to close Edge processes by name. Code and model work carries on without Edge in the meantime.

Tell me when the transfer's done and I'll restart the render where it stopped.

---

**Shaun (while Claude was working):** can you pause all edge processes for 45 min, I keep ending them anyways, let the file transfer finish

**Claude:**

Rendering is paused until 12:52 and won't restart before then. No hidden Edge from my side is running right now, so anything Edge you see is yours.

- The agent building the animation has been told not to start Edge at all, not even for one test image, until I give it the go.
- A 45-minute timer is running. At 12:52 I'll check that no other render is running before restarting from frame 363 of 2,925. If the transfer needs longer, just tell me and I'll keep holding.
- Work that doesn't need Edge carries on in the meantime.

I've looked at two of the new stills. G-3 sits among the habitat modules with SPACEDIRT and the three-star mark on its side, and the cutaway shows the SLED75 in the bay with the door stowed under the roof. I'll show you the full set once the film is done.

The maple leaves on the SLED in the new stills come from your mast v7 cut-outs in the CAD, the side-leg leaves you kept, so I've left them in. The garage itself carries only the SpaceDIRT livery. Rendering is still paused until 12:52.

The animation rebuild is finished apart from the film, which is still paused for your transfer. I'll restart it at 12:52; it needs about 60 to 90 minutes more.

**Done and checked**
- The 3D viewer (`G3_sequence.html`) and five stills are in `design\animation\`.
- The SLED75 in the scene is your actual CAD: the rev H loader and the v3.8 tiller.

**Three things the real CAD shows**
1. **The door is taller than it needs to be.** The real SLED75 is only 1.14 m tall: the mast you ordered is a rear goalpost, not the 1.0 m column the sizing assumed. The tyres are also 0.52 m, not 0.57 m. That leaves about 0.4 m of spare height in the 1.70 m door. Together with the mast question I asked earlier, the garage could get both shorter and lower. I haven't changed it; your call.
2. **The tiller scrapes.** Raised for driving, the tiller only clears slopes up to about 8.4°. The ramp and the regolith ramp outside are both 10°, so the tines touch at the foot of each slope by 6 to 15 mm. It's visible in the film at about 46 s and 52 s. The fixes are 8° slopes, a short transition at each foot, or more tiller lift for driving.
3. **The SLED backs in, tiller first.** The layout puts the loader at the door end, so the rover reverses in. Driving in loader first doesn't fix the scraping, because the trailing tiller dips the same way.

The agent also drew some parts that aren't designed yet, so treat these as placeholders: the telescoping ramp tracks, the plate that bridges the threshold, the latches, and the hinge drive.

The 45-minute pause ended at 12:52 and I've restarted the film render from frame 363. It should take about 60 to 90 minutes, then a few minutes to encode.

If your transfer is still running, tell me and I'll pause it again.

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** can you pause again for 5 min

**Claude:**

Everything that was rendering in Edge is stopped. Your own Edge is still running. The film paused at frame 1,031 of 2,925 and the frames done so far are kept.

I'll restart the film render after 5 minutes. Tell me if you need longer.

The 5-minute pause is over, so I've restarted the film render from frame 1,031 of 2,925. About 1,900 frames are left, which should take roughly 45 to 60 minutes plus a few minutes to encode.

Another session has a hidden Edge render running again. I'm leaving that one alone.

Tell me if you need Edge paused again.

The G-3 animation is finished. I checked that the film plays the full 117 seconds and looked through the 12-frame contact sheet; the captions match what's on screen at each step.

All in `design\animation\`:
- **`G3_sequence.mp4`** — the 117-second film:
  - pump-down with air drawn through the floor
  - the door moves in, lifts and swings up to the roof
  - the bridge plate drops over the threshold and the ramp tracks deploy onto the regolith ramp outside
  - SLED75 backs in
  - the door closes and seals, and the floor downdraft carries dust to the hopper
  - crew come through the shower in the dust lock and work on the SLED in shirtsleeves
- **`G3_sequence.html`** — the 3D viewer. It has only been tested in a hidden browser, so tell me if it misbehaves when you open it.
- **`G3_sequence_frames.png`** — 12 frames from the film on one sheet.
- **Five stills** (`G3_still_*.png`) — establishing shot, both sides showing the logo, door stowed with the SLED inside, and crew at work.

- **Font licence:** buy the commercial licence for the logo font first, or switch it to the stand-in font with one line.
- **Design status:** the hull and door follow your direction, but the rest of the layout is my proposal and hasn't been reviewed.

Still open for you:
1. **SLED mast position:** where the mast sits front to back. The garage could get about 1 m shorter and 0.7 t lighter.
2. **Door height:** the real SLED is only 1.14 m tall, so the 1.70 m door has about 0.4 m spare. Do you want to shrink it?
3. **Tiller scrape:** the tiller tines touch the foot of each 10° slope by 6 to 15 mm. The options are 8° slopes, a short flat transition at each foot, or lifting the tiller higher for driving.

*[6 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** no I dont mind the moon stuff, although we will need to show tiller ahead of the loader in the trenches

**Claude:**

The G-3 film already has the SLED backing into the garage tiller first, so the tiller leads there too.

There are no trench scenes in the G-3 film. If you want one, for example the SLED trenching near the base before it drives in, I can add it with the tiller leading.

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** is G3 update done?

**Claude:**

Yes, the sizing and the animation are done. The written report and the pitch deck have not been updated yet.

**Done and checked**
- **G-3 sizing** in `design\G-3\`: 4.2 m diameter × 7.76 m long, door opening 2.88 × 1.70 m, door panel swings in and up to the roof, 9.2 t with growth. Re-running it gives identical results.

**Not updated yet**

**Design questions still open**
- Where the SLED75 mast sits front to back. It could make the garage about 1 m shorter and 0.7 t lighter.
- Whether to shrink the door height: the real SLED is 1.14 m tall, so the 1.70 m opening has about 0.4 m spare.
- How to stop the tiller scraping at the foot of the ramps.
- Whether crew pass through a separate dust lock or the bay itself acts as the airlock.

Should I update the report and the deck to G-3 next? I'd do the deck first, since it's short and goes outside the company. The report is a bigger rewrite.

*[4 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** BIG PROBLEM, the door opens on a hinge.. I was expecting it to come in, then slide upwards, kinda like a solid garage door, because otherwise, you lose that payload area

**Shaun (while Claude was working):** it should also be curved I believe for the tension load and also for conenience when sliding upwards

**Shaun:** Picked: End door, curved (Recommended)

**Claude:**

You're right, and that was my misread. You said "swing in and up" and I built a top hinge. A hinged door sweeps an arc through the front of the bay, which cost about 2 m of floor.

**The new door is now being sized:**
- **Shape:** one solid curved panel that bulges out about 0.1 m, so cabin pressure pulls it into tension.
- **Motion:** it moves in 5 cm off its seals, lifts 12 cm, then rolls up curved side tracks like a one-piece garage door. It parks under the roof, bulging upward.
- **Floor:** nothing swings through the bay, so the SLED can pull up close to the door. I'm keeping the 7.76 m length so the freed floor becomes payload space. A shorter, lighter version comes as a side option.
- **Next:** the sizing works out the curve, the tracks and how much floor it frees. Then the animation agent updates the 3D model and re-renders the film.
- **Old version:** the hinged-door film and stills go to `old\` as the "hinged door version".

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** research different airplane door architectures, are there any that go up?  Should we put the door in the side of the tube???????????

**Claude:**

**Yes, there is one airliner door that goes up, and it's the door you described: it sits in the side of the tube.** I'd put G-3's door in the side too, and I've started sizing that version next to the curved end door so you can choose from numbers. The animation is on hold until you pick.

**Airliner door types**

| Type | How it opens | Examples | What holds it shut |
|---|---|---|---|
| **Inward plug, stows overhead** | Moves in a few inches, then slides **up along the inside of the curved fuselage wall** on tracks into the space above the ceiling | DC-10 and L-1011 main doors; Boeing patents | Cabin pressure (plug) |
| Plug that exits outward | Moves in, folds its top and bottom edge panels, swings out | 737, A320 | Cabin pressure |
| Translating outward plug | Moves straight out on linkages | Boeing patent | Cabin pressure |
| Cargo door hinged at the top | Swings **up**, but outside the aircraft | 747-8F side cargo door (3.05 × 3.40 m) | Latches only; the type that failed on United 811 |
| Removable hatch | Lifted in by hand | Overwing exits | Cabin pressure |
| Large end doors and ramps | Nose visor or rear ramp | C-5, An-124 | Latches; the An-124 hold runs at only 3.6 psi |

Boeing's patent describes the overhead door as you did: the tracks "guide the door first inboard several inches to clear the doorway, then upwardly along the inside of the fuselage wall". It also says "the curved contour of the fuselage conveniently accommodates the similarly curved door". The curve makes the slide easy because the door follows the wall it's already shaped to. The DC-10 and L-1011 details come from pilot forums, so treat those as secondary. The Boeing patents are the solid source.

**Door in the side of G-3**

What we gain:
- **No sweep at all.** The door is a curved piece of the hull. It moves in 5 cm, then rides circular tracks along the inside of the wall and parks up on the upper wall, with nothing crossing the bay.
- **It carries pressure the way the hull does,** in hoop tension. The curved end door has to fake that with its own bulge and a track bend.
- **The SLED fits across the tube.** The floor is about 3.6 m across and the SLED is 2.37 m long. The door's width along the tube isn't limited by the round end, so it could take two SLEDs side by side.
- **The front becomes a plain dome,** lighter than a flat wall with a door frame.

What it costs:
- **A big hole in the side of a pressurized tube.** It needs heavy frames along its edges to carry the hoop load around the hole. On airliners that framing around the door is a major mass item. This is the number to watch.
- **Some equipment moves.** The tanks and boxes on that upper wall go to the other side, and the outside ramp moves to the side of the garage.

The sizing gives both versions the same treatment:
- **Side door, two widths:** about 2.9 m, and the widest that fits two SLEDs.
- **Curved end door,** for comparison.

Each gets the mass, the framing around the door opening, the usable floor, how many SLEDs fit, door force and seal length. I'll bring you the comparison when it's done.

Sources:
- [US4375876A, Overhead sliding door and foldable cabin panel assembly for an airplane (Boeing, 1981)](https://patents.google.com/patent/US4375876)
- [EP0188825A2 (Boeing), background on inward-and-up plug doors](https://patents.google.com/patent/EP0188825A2/en)
- [FlyerTalk: exit slides on L-1011 and DC-10](https://www.flyertalk.com/forum/11172635-post2.html)
- [PPRuNe: DC-10 and TriStar door drive](https://www.pprune.org/aviation-history-nostalgia/602995-dc-10-tristar-5.html)
- [Plug door, Wikipedia](https://en.wikipedia.org/wiki/Plug_door)
- [US4720065A, translatable outward-opening plug door](https://patents.google.com/patent/US4720065)

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** does bombardier make their own doors? or supplier? is the supplier in Canada in Quebec? what about cargo doors?

**Claude:**

**Short answer:** for Bombardier's own jets, who makes the main passenger door isn't public. Bombardier builds much of its structure itself and contracts some door work out. The only Quebec door supplier I could confirm is L-3 MAS in Mirabel, for the Global's overwing exit doors. Every door on the A220, which is assembled in Mirabel, is now made in India.

**Bombardier business jets (Global, Challenger)**
- **Main passenger door:** I couldn't find a named supplier.
- **Fuselage:** Bombardier's plant in Querétaro, Mexico makes the rear fuselage of every Global, plus fuselage parts for the Challenger 3500. STELIA Aerospace designs and builds the Global 7000's centre fuselage.
- **Overwing emergency exit doors (Global 7000/8000):**
  - **2012:** STELIA's predecessor, Aerolia, gave the design and build contract to **L-3 MAS in Mirabel, Quebec**.
  - **2018:** a release says STELIA picked **Latécoère** (France) for that door. The two contracts may cover overlapping work.
- **C Series door sets:** one older article says Querétaro made them. I couldn't confirm it elsewhere.

**Airbus A220 (the former C Series, assembled in Mirabel)**
- **Who makes the doors:** in 2024 Airbus gave all eight doors per aircraft to **Dynamatic Technologies in Bengaluru, India**: passenger, service, **cargo** and overwing exits. The first complete set was ready in January 2026.
- **Design:** Airbus Canada in Mirabel still has a door design team, according to a job posting, but the doors are built in India.

**Door companies in Quebec**
- **L-3 MAS, Mirabel:** overwing exit doors for the Global, above. I haven't checked whether it's still active under that name.
- **Avior Integrated Products, Laval:** assembles access doors for Boeing on the 737 MAX.
- **Latécoère Services Canada, Laval:** an engineering office of Latécoère, the French company that is one of the biggest aircraft door makers. It makes the Falcon 10X passenger door, for example. I found no Latécoère door production in Quebec.

**Cargo doors**
- **Airliners:** Airbus makes A320 cargo and bulk doors at its own Querétaro plant, and Tata (India) also builds them. A220 cargo doors come from Dynamatic, as above.
- **Canadian cargo-door work** is in freighter conversions, outside Quebec:
  - **De Havilland Canada (Calgary):** a large cargo door kit for the Dash 8-400, 109 × 69 in, forward right side.
  - **Muskoka Mod Centre (Gravenhurst, Ontario):** a Dash 8-400 cargo door that slides, with no power or actuators. Approval was expected by 2024; I didn't confirm it happened.
  - **Cascade Aerospace (BC):** Q400 conversions and the first CRJ200 package freighters.
  - **AEI (US):** the CRJ200 freighter, with a large main cargo door approved by Transport Canada.

**For the garage door**, Latécoère is the obvious door specialist, through its Laval office. L-3 MAS in Mirabel has actually built pressurized plug-type exit doors in Quebec. Muskoka's unpowered sliding cargo door is the closest match to the slide-up door we're designing.

Some of these sources are trade press and job postings, so check the details before any contact.

Sources:
- [Latécoère sélectionné par STELIA Aerospace (Global 7000 overwing exit door)](https://aeromorning.com/latecoere-selectionne-stelia-aerospace/)
- [L-3 MAS wins Aerolia contract for Bombardier Global 7000/8000](https://skiesmag.com/press-releases/17400-l-3-mas-wins-aerolia-contract-for-bombardier-global-7000-800-html/)
- [Wings Magazine: L-3 MAS selected to design exit doors on Global 7000/8000](https://www.wingsmagazine.com/l-3-mas-selected-to-design-exit-doors-on-global-7000-8000-7766/)
- [Bombardier Querétaro 15 years, 100th Global 7500 rear fuselage](https://www.aviationpros.com/aircraft-maintenance-technology/aircraft-technology/business-general-aviation/press-release/21222062/bombardier-aerospace-bombardier-celebrates-15-year-anniversary-of-its-queretaro-mexico-site-as-facility-delivers-the-100th-global-7500-aircraft-rear-fuselage)
- [Bombardier to increase aerospace parts production in Mexico](https://www.americanindustriesgroup.com/news/bombardier-to-increase-aerospace-parts-production-in-mexico/)
- [Airbus awards A220 door order to Bengaluru (Airbus, Feb 2024)](https://airbus.com/en/newsroom/news/2024-02-airbus-awards-landmark-aerospace-order-for-a220-aircraft-doors-to-bengaluru)
- [Dynamatic delivers first complete A220 door shipset (Jan 2026)](https://machinist.in/2026/01/dynamatic-technologies-delivers-first-complete-ship-set-of-airbus-a220-aircraft-doors/)
- [Airbus Mirabel A220 door design job posting](https://flexa.careers/jobs/airbus-concepteur-int-grateur-structure-de-portes-design-integration-professional-doors-structures-6ab7940784433c34e5794f88)
- [Avior to partner with Boeing on 737 MAX](https://www.canplastics.com/canplastics/quebecs-avior-partner-boeing-737-max-airplane-program/1003444320/)
- [Aéro Montréal: Latécoère Services Canada](https://www.aeromontreal.ca/wings-magazine-presents-latecoere-services-canada.html)
- [De Havilland Canada Dash 8-400 cargo conversion solutions](https://dehavilland.com/en/news/posts/de-havilland-canada-launches-cargo-conversion-solutions-utilizing-dash-8-400-aircraft)
- [Aviation Week: De Havilland Canada proposes freighter conversion trio](https://aviationweek.com/air-transport/location/de-havilland-canada-proposes-freighter-conversion-trio)
- [Muskoka Mod Centre to convert Dash 8-400s to freighters](https://airinsight.com/muskoka-modification-to-convert-dash-8-400s-to-freighters/)
- [FlightGlobal: first Q400s head for cargo conversion](https://flightglobal.com/first-q400s-head-for-cargo-conversion/79457.article)
- [AEI gets Transport Canada approval for CRJ200 SF](https://www.stattimes.com/news/aei-gets-transport-canada-approval-for-crj200-sf-freighter-conversion-air-cargo)

The curved end door's layout is worked out; mass and the side-door version are still being sized.

- **Door:** one solid panel bulging out 0.10 m, only 0.08 m thick. That's half the old flat door's 0.17 m, because pressure now pulls it into tension instead of bending it.
- **Motion:** the door moves in 0.11 m (it has to clear the frame with its bulge), lifts 12 cm, then rolls up side tracks to park under the roof, bulge up. Headroom under it is 1.86 to 1.96 m.
- **Floor reclaimed:** the SLED now stops 1.14 m inside the door instead of 2.19 m. With the real 1.14 m-tall SLED it could stop at 0.70 m. At the same 7.76 m length, that leaves 0.83 m of clear floor ahead of the SLED and a 1.90 m aisle behind it.

The side-door version comes next. Then you get the comparison: mass, usable floor, how many SLEDs fit, door force and the framing around the door opening. The animation stays on hold until you choose.

The rebuild found a clash: the ramp tracks were stowed in the floor right under the parked SLED's wheels, so they couldn't slide back in. I've fixed it by moving them down a level. They now stow in two channels under the floor plate, in the space below the deck, and retract underneath whatever is parked. When the door is open they slide out over the threshold and tilt down onto the regolith ramp.

That keeps your "internal ramp extend and deploy down" direction. The rebuild agent had suggested folding the ramp up outside against the door face, which would have broken it.

The fix goes into whichever door you pick, end or side. The sizing is still running; I'll bring you the end-versus-side comparison when it's done.

---

**Shaun:** give me a quick twenty second read on using the door on the end vs side?

**Claude:**

**Door on the end**
- The layout stays as it is: the vehicle drives in along the length, and room for longer vehicles is kept.
- The curved door has to ride tracks with a bend in them. It still uses up about 1.1 m of floor at the front of the bay.
- The flat end wall carries the full door load as a frame. That's heavy.

**Door in the side**
- This is how airliners do it. The door is a curved piece of the hull and slides up along the inside wall on simple circular tracks, taking no floor at all.
- The front end becomes a plain dome, which is lighter.
- The SLED parks across the tube, and the door can be wide enough for two SLEDs side by side.

**My read:** for SLED-class rovers, the side door, as long as the framing around the opening doesn't eat the mass it saves. The numbers will show that shortly.

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** 15 psi doens't seem like that much?

**Claude:**

You're partly right: the pressure is low for a curved skin. It only gets big on flat panels and around holes, because it's spread over so much area. Note too that G-3 runs at 8.2 psi (56.5 kPa, the lunar habitat standard), not 15 psi; 15 psi is sea level, as on the ISS.

**Where it really is small:**
- **The curved shell.** 8.2 psi in a 4 m tube puts only about 28 MPa in a 4 mm aluminium skin, roughly a tenth of what the metal can take. The shell thickness is set by handling and micrometeoroid protection, not pressure.

**Where it adds up:**
- **Per area.** 8.2 psi is about 5.8 tonnes of force on every square metre, since a square metre is 1,550 square inches.
- **The door.** The seal area is about 5.4 m², so the door carries about 31 tonnes (303 kN), and 38 t at the maximum design pressure.
- **The end of the tube.** About 72 tonnes pushes on each end.
- **The hoop load.** The tube's wall carries about 11.5 tonnes per metre of length along each side. Cut a 2.9 m hole in the side and about 33 tonnes on each edge has to be routed around it. That's the framing cost of a side door.

So 8.2 psi is easy on a curved shell, which carries it in tension. It's hard on anything flat or anything with a hole, where it has to be carried by bending. That's why your instinct to curve the door is right. It's also why airliners, which run at about the same 8 psi, put their heaviest structure around the doors.

At sea-level pressure (14.7 psi) every one of these loads goes up 1.8 times.

---

**Shaun (while Claude was working):** okay lets keep the end design for now then

**Claude:**

We're going with the end door: the curved panel that rolls up side tracks to park under the roof.

The side-door study is stopped. The sizing is now finishing the mass, the ramp channels under the floor and the figures for the end door. The animation agent has started building the new door into the 3D model:
- The door moves in, lifts and slides up to the roof.
- The SLED stops 1.14 m inside the door.
- The ramp tracks come out from under the floor.

The hinged-door versions are moving to `old\`.

The end-door geometry is final and the film is now rendering. Nothing else heavy is running on the laptop, so it's clear to go.

One design change on the way: the ramp tracks are now 9 hinged segments that lock straight as they come out. A rigid 4.8 m track can't make the S-shaped climb from under the floor up over the threshold without hitting the floor plate. That's my proposal, not designed in detail. It adds about 113 kg, bringing the ramp to 227 kg.

The curved door is final, and your curve made it lighter. I re-ran the sizing, got the same results, and hand-checked the door loads.

- **Why it's lighter:** the curve puts the door panel in tension, so a 4 mm skin carries the load. The cost is a pull on the top and bottom edges of the door frame (321 kN per metre at the maximum design pressure). The front wall takes that as a deep beam with 83 kg of edge reinforcement.
- **Payload floor:** at the same 7.76 m length you get back 1.05 m of floor (3.8 m²). There's also 7 m² of floor under the stowed door with 1.86 m of headroom.
- **Shorter option:** turning the freed floor into a shorter garage gives 6.70 m long and 8.2 t with growth. That's just over the 8 t CLPS growth target. It's on file if you want it.
- **Tight spots:** the door clears the hull by 5.4 cm at its closest point as it moves, against our 5 cm minimum. When stowed it sits 7 cm below the roof each side.

The film is rendering now. I'll check the frames and then send you the film, the 3D viewer and the stills.

*[8 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** okay good, pay attention to the cutaway views on teh render, maybe we don't need the cutaway on the drive in, but only to show inside and then person walking across.. see if you can get it a bit shorter

**Claude:**

I've held the full render. Nothing of ours had started yet, so nothing was wasted. Here's the new cut I've given the animation agent:

- **About 85 to 95 seconds**, down from 117. The slow steps get tighter timing instead of being dropped: latches, bridge plate, ramp run-out and stow, dust.
- **No cutaway from the start through to the door closing.** The door moving in, lifting and sliding up, the ramp running out and the SLED driving in are all shown from outside, looking through the door opening.
- **Two cutaways only:**
  1. The inside reveal once the door is shut: the SLED in the bay, the stowed door under the roof, the hopper below.
  2. The person walking across: from the hab hatch, through the dust-lock shower, across the bay to the SLED, then working in shirtsleeves.
- **Cleaner cutaways:** sharp cut edges, cut faces filled in so the hull doesn't look paper-thin, and no parts vanishing. The old film had a habitat module drop out during the cutaway; that gets fixed.

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** hows that render going? its been a quite

**Claude:**

It's almost done. The film is 1,829 frames into 2,225, about 82%. Rendering started at 14:44 and runs at roughly 100 frames a minute, so the frames should be finished in about 4 minutes.

After that comes the encode, which takes about 5 minutes, then the contact sheet, stills and viewer. Allow about 15 to 20 minutes all in. I'll check the frames and send you the film when it lands.

The new film is done and checked. It's 89 seconds, plays through, and I looked over the 12-frame contact sheet.

Everything is in `design\animation\`:
- `G3_sequence.mp4`, the film
- `G3_sequence.html`, the 3D viewer
- `G3_sequence_frames.png`, the contact sheet
- five stills, including the door stowed under the roof with the SLED inside

The hinged-door versions are in `old\`.

**What the film shows**
- **Outside, through to the door closing:** the curved door moves in, lifts and slides up to the roof, seen through the opening. The bridge plate drops over the threshold, and the ramp tracks run out from under the floor and lock straight. The SLED backs up the ramp tiller first, then the tracks slide back and the door comes down and seals.
- **Cutaway 1, the inside:** the SLED parked, the floor downdraft carrying dust to the hopper, the door tracks under the roof.
- **Cutaway 2, the crew:** from the habitat hatch, across the node and through the dust-lock shower to working on the SLED in shirtsleeves.

**Still open**
1. **Ramp track stowage:** the segmented tracks need about 0.54 m more room under the floor than the design gives, so the film tucks the tail down at the back as a placeholder.
2. **Floor covers:** the covers over the ramp tracks' exit by the door can only partly open, because the parked loader bucket sits over the back part.
3. **Tiller scrape:** the tiller tines touch the foot of the 10° ramp and berm by 6 to 15 mm. It isn't visible at film scale.
4. **Logo font:** the font licence is still open.

*[7 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** is the latest animation ready?

**Shaun (while Claude was working):** did you get my vision message from the other agent for future animations (don't overwrite this one)

**Claude:**

Yes, the latest animation is ready: the 89-second film with the curved sliding door. I've opened it on your screen. It's `design\animation\G3_sequence.mp4`.

**Your vision message hasn't reached me.** Nothing about future animations has come in from any agent. I've asked the animation agent, since you sometimes talk to it directly, to send me your message word for word if it has it. If it was a different session, paste the message here or tell me which session and I'll pick it up.

**This film won't be overwritten.** I've saved a copy of the whole set (film, viewer, contact sheet and five stills) in `design\animation\keep G3 2026-11-05\`. I've also told the animation agent that future animations go to new file names, never over this one.

Your vision message hasn't reached me. The animation agent says you didn't message it directly either.

When it arrives I'll save it as standing direction for future animations. The current film is protected either way: a copy sits in `design\animation\keep G3 2026-11-05\`, and future animations go to new file names.

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** Can you document how you are doing the animations and prompts to date in a public github on sariddel that I can share with my friend

**Shaun:** Picked: Everything shareable; claude-engineering-animation (Recommended)

**Shaun (while Claude was working):** also include the latest render

**Claude:**

Still building the repo. I'm checking package versions so the README's install steps are accurate.

The public build works without the SLED CAD or the logo font: the scene renders with a placeholder rover and the fallback wordmark. Now the docs and the prompts.

Writing the prompts document next: your messages and the agent briefs, with restricted programme details taken out. Then I'll scan everything before publishing.

The scan is clean: no hits across the 26 text files for agency, contract, restricted vehicle, personal email or local path strings. Publishing now.

The repo is live. Now a quick look at the test stills for the web cut before it renders.

Your public repo is up: **https://github.com/sariddel/claude-engineering-animation**

**What's in it:**
- **README:** the latest 89-second film, the 12-frame contact sheet, the pipeline in one diagram, and how to run it.
- **docs/pipeline.md:** sizing → geometry file → 3D scene → frames → H.264, with the commands. It also covers working on a laptop shared with other sessions: one heavy render at a time, stopping only our own processes, pausing for your Edge.
- **docs/agents.md:** how the work was split between me, the sizing agent and the animation agent, and the check loop: re-run, hand-check, test stills, then render.
- **docs/prompts.md:** your messages, word for word, plus condensed agent briefs. The only edits are cuts marked `[...]`, all of them agency, contract or vehicle-class references.
- **docs/lessons.md:** the hinge misread, why the curved door paid off (99 kg against 393 kg), why aircraft seals don't work in space, why a smaller garage isn't small in mass, and cutaways only where they explain something.
- **Code and media:** the 3D scene and render tools, the G-3 geometry file and figures, the film and five stills.

**What's left out:**
- **The SLED75 CAD mesh.** The public build draws a placeholder rover of the same size; I test-rendered a frame and it works.
- **The sizing script and results,** because they carry restricted inputs.

I scanned every text file for agency, contract, restricted-vehicle, email and local-path strings, with zero hits. As you chose, the repo publicly discloses the curved sliding-door garage concept.

- the tiller SLED loosens a 6 × 6 m foundation pit;
- the loader feeds the hopper;
- the bucket elevator throws regolith up onto the habitat roof.

*[7 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** can you zip the chat folder and dump it in there too

**Claude:**

I haven't put it in the public repo, and I'd recommend against it. The chat folder holds every Claude Code session on this laptop, not just this one: 86 conversations, 4.7 GB. That's far over GitHub's 100 MB file limit.

The bigger problem is what's in it. This session's transcript alone mentions:

What I can do instead:
1. **A cleaned chat log in the repo (my recommendation).** Your messages and my replies from the garage and animation work, without the tool dumps. I'd cut the same items as `docs/prompts.md` (restricted, contract and business details) and add it as `docs/chat.md`.
2. **A raw zip of this session only, kept private.** Saved to your project folder or Downloads, not GitHub, for you to look through and decide what to share. It's about 57 MB before zipping.

Which do you want?

*[10 lines removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** ohhh yeah that's too much, just this session

**Claude:**

This session's chat is zipped and saved privately at `chat\session e0233d9f 2026-11-05.zip` (503 MB). It includes the main conversation, the helper agents' transcripts and the tool outputs.

For the repo itself, I can add a cleaned chat log (`docs/chat.md`) instead: your messages and my replies about the garage and animation, with those details cut. Just say if you want it.

*[1 line removed: restricted programme detail, earlier designs, or other projects]*

---

**Shaun:** hmmm yeah okay clean it out before uploadign

**Claude:**

Building `docs/chat.md` from this session's transcript now. It starts at your airlock door question and runs through the G-3 design, the renders, the animation and this repo, with your messages and my replies only.

It cuts:
- other sessions' business
- emails and local paths

Then I scan and review it before pushing.

Escaping got mangled in that patch. Fixing the line directly.

Shell escaping again. Fixing the two regexes with direct edits.

Still cleaning the chat log. I'm dropping the leftover earlier-design numbers and the off-topic exchanges entirely, then I'll re-scan.

*[2 lines removed: restricted programme detail, earlier designs, or other projects]*

---

