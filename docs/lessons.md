# Lessons

## Design

- **Read the verb carefully.** "Swing in and up to the roof (like some airplanes?)" was built as a top hinge. Shaun meant a door that comes in, then slides up. A hinged leaf sweeps an arc through the bay and cost about 1 m of floor. Airliners that stow doors overhead (DC-10, L-1011, Boeing patent US4375876) move the door inboard a few inches, then up along the inside of the curved wall. When a reference is ambiguous, ask with a sketch of each reading before building.
- **Curving the door was his idea, and it paid.** A flat 3.08 x 1.90 m plug leaf needs a 0.17 m sandwich, about 393 kg, to carry 8.2 psi in bending. Curved with a 0.10 m bulge, it carries the same load in tension, N = p x R = 70.3 kPa x 4.56 m, about 321 kN/m: a 4 mm skin, about 99 kg. The cost is an in-plane pull on the top and bottom frame members.
- **Low pressure is easy on a shell and hard on a flat panel or a hole.** 8.2 psi is about 5.8 t on every square metre: about 31 t on the door, about 72 t on each end of a 4 m tube, and about 33 t of hoop load to route around each edge of a 2.9 m hole in the side.
- **Aircraft seals are not space seals.** An airliner's whole fuselage may leak like a hole the size of a coin, because outside air is free. A pressurized garage on the Moon has to be thousands of times tighter. Keep the airliner plug-door idea; use a spacecraft double seal.
- **A smaller garage is not small in mass.** Shell, insulation, shielding, deck and legs scale with surface area. The door sweep, an aisle and a dust lock add metres to a 2.4 m rover. The SLED75-class garage came out at about 8 to 9 t with growth, not 3 t.
- **Check the design vehicle against real CAD.** The sizing envelope assumed a 1.55 m mast; the real rover tops out at 1.14 m. The film used the real CAD, and the difference showed up as spare height.
- **Mechanisms show up in the film.** Stowing a 4.8 m rigid ramp under a parked vehicle didn't fit. It became a chain of nine hinged segments, and that is still an open item.

## Film

- **Cutaways where they explain something, not everywhere.** Shaun asked for the drive-in from outside, with cutaways only to reveal the inside and to follow the crew. That cut the film from 117 s to 89 s.
- **Cap the cut faces.** Without caps, a clipped hull reads as a paper shell.
- **Same camera, same scale.** "I can't understand the size" was answered by putting the new garage on the same node arm as the old one, from the same camera, with a rover and a person as yardsticks.
- **Never overwrite a delivered film.** New versions get new names, and a protected copy is kept.

## Working with agents

- **One source of truth for geometry,** a JSON written by the sizing and read by the scene. Disagreements go back to the sizing, not into the scene.
- **Rerun and hand-check before reporting.** Every agent hand-back was rerun: byte-identical results, and four or five numbers recomputed by hand.
- **Test stills before a long render.** Six stills caught two drawing faults in minutes. The full render takes about 20 minutes on a laptop CPU.
- **Shared laptop.** One heavy render at a time. Stop only your own processes, by PID. Pause when the user needs the machine.
