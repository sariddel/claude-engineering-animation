# How the work was split

One main Claude Code session talked to Shaun. It delegated two long jobs to background agents and checked both against disk before reporting anything.

| Role | Did | Never did |
|---|---|---|
| Main session | Talked with Shaun, wrote the agent briefs, relayed his decisions word for word, reran the sizing script and hand-checked key numbers, looked at stills and contact sheets, coordinated with other sessions on the laptop | Present an agent's numbers without rerunning them |
| Sizing agent | Owned the sizing script, the results and the geometry JSON in its own folder | Touch the scene, the film or older designs |
| Scene agent | Owned the three.js scene, the SLED model built from CAD, the film, the viewer and the stills | Change the geometry JSON; render the full film before the main session said "geometry final" |

## The loop that worked

1. **Shaun gives a direction in chat.** The main session quotes it word for word in the brief, so the agent works from his words, not a paraphrase.
2. **The main session writes a brief**, laid out as goal, where things are, what to build, rules, and what to hand back. Design choices the agent makes must read as its proposals, not as Shaun's calls.
3. **The sizing agent writes the geometry JSON early** and messages the main session, which tells the scene agent the JSON exists. The scene agent builds and makes test stills, but holds the full render.
4. **The main session reruns the sizing**, confirms the JSON is byte-identical, and hand-checks a few numbers (door force, seal length, membrane force, mass at 20% growth). Only then does it send "geometry final".
5. **The scene agent sends test stills of the key moments.** The main session looks at them and asks for fixes. On one pass it caught a ramp chain curling at the wrong end and a label pointing at empty space. Then it sends "render".
6. **The hand-back lists files, sizes, duration and every open issue.** The main session decodes frames from the final MP4 and reads the contact sheet before telling Shaun.

## Messages between agents

- Agents message the main session with interim notes ("json written") and a final hand-back.
- The main session relays Shaun's decisions to whichever agent needs them, word for word, with a short instruction.
- Other sessions on the laptop worked on the company website, the keynote and other projects. They asked for paths, the scene API, a frame time with the door open and the rover on the ramp, and the restrictions on each output. The main session sent those, and warned when something wasn't cleared for public use.
- Course corrections went out at once, for example "STOP the current film render now, by your own PIDs." A message only reaches a busy agent at its next tool call, so the main session stopped its own render processes directly when it had to, by PID, after checking the command line.

## Rules every brief carried

- **First order only:** low, nominal and high bands, simple machinery, labelled assumptions. No invented numbers presented as data.
- **Restricted data stays out.** Programme-restricted inputs were tagged and kept out of anything meant for outside use. These public files contain none.
- **Generic web requests:** a plain User-Agent, never the user's name, email or company. If a site refuses a fetch, leave that source out.
- **Attribution:** Shaun's calls are quoted as his; the agents' choices are labelled as proposals.
- **Stay in your own folder,** and back up before overwriting.
- **Agents don't spawn more agents,** and there are never more than 10 at once.
