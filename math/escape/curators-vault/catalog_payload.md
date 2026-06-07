# Applet entry: math/escape/curators-vault

- **Path:** https://frohlich-math-physics.netlify.app/math/escape/curators-vault/ — **LIVE** (verified 2026-06-07)
- **Tier:** Premium (escape room — Applet_Conventions §3.3; Premium_Materials_Design_v2)
- **Type:** Gated reveals + multi-lock state machine (escape room). Novel artifact; applet-family tech.
- **Built for:** IB MAI SL Topic 4.9 (Normal Distribution) capstone — Level 1 (Empirical Rule). Levels 2–3 later phases.
- **Mode(s):** single experience (no `?mode=` routing). Phasing is by Level (1 built; 2/3 deferred).
- **Dependencies:** local-only. Vanilla HTML/CSS/JS, single self-contained `index.html` (inline CSS/JS). No CDN, no web fonts, no frameworks. Audio loaded from `/assets/` at runtime, silently optional.
- **Mobile:** best-effort, CSS-tested at 390 px (single-column locks, full-width fields, ≥38–46 px touch targets). Hardware verification by Mr. F.
- **Offline:** yes after initial load. Only network call is the optional pipeline POST (`REPORT_MODE='live'`), which is fire-and-forget and never blocks play.
- **Screenshot path:** _pending_ (Gdrive 02_Resources_Library — capture after Mr. F first-pass)
- **Built:** 2026-06-06 · **Rev 1:** 2026-06-06 (single voice channel + sequencing; input-overflow fix; dark briefing screen with `curator_intro` moved here; per-stage Amara radio text; dark map + results; per-panel Kai hints; water ambient auto-start; Stage-3 per-dial Set.)
- **Rev 2:** 2026-06-06 (Kai hints reduced to sigma-distance only — no percentage stated; Stage-2 sketch shows sigma bands with no percentage labels; Amara radio "incoming transmission" treatment with CSS arrival jitter, visual-only; on-screen Curator text echoes the opening of each spoken line. Seven answers and Empirical-Rule scope unchanged across both revisions.)
- **Rev 2.1:** 2026-06-06 (radio line rebuilt to the manager's exact spec: `.radio-msg` panel with "INCOMING TRANSMISSION · DR. OSEI" tag, 22px pulsing icon, 16px italic body; 0.45s arrival jitter re-fired every reveal via `showRadio()` forced reflow — fixes the Rev-2 jitter that ran once while hidden and never replayed. Math/scope unchanged.)
- **Rev 3:** 2026-06-06 (art + story + structure pass: archive `bg-archive.png` background + dark scrim; dark ID gate with empty fields; two-screen intro replacing the single briefing; VERBATIM Curator captions; portraits woven in — Curator/Amara/Kai/Custodian; bigger pulsing radio (34px icon, breathing body + portrait, arrival jitter kept); vertical bottom-to-top map with ladder rail; rising-water mechanic ending waist/chest in Level 1; dark results that open Vault Two. All five images degrade gracefully — missing file → text-only, no broken icons, no layout collapse. Seven answers and Empirical-Rule scope unchanged.)
- **Art assets (Mr. F supplies → `assets/img/`):** `bg-archive.png`, `curator.png`, `amara.png`, `kai.png`, `custodian.png`. Stub folder with filename manifest shipped.
- **Rev 4:** 2026-06-06 (Vault Custodian becomes a VOICED judge: `custodian_cast` on the cast screen, `custodian_map` on the map (new voice hook), `custodian_wrong` on wrong answers — all on the SAME single voice channel as the Curator, never overlapping; Custodian voice debounced ~2s. Curator's `curator_wrong` retired. Kai hints reworded to "standard deviation(s)"/"mean". Amara radio re-anchored as a right-side vertical block. Siren loops continuously as flood ambience, decoupled from the race timer (timer shown only by its countdown). Results narrator paragraph rewritten for the ascent (Curator caption unchanged). Seven answers and Empirical-Rule scope unchanged.)
- **Rev 5:** 2026-06-06 (Amara's transmission now floats as a fixed lower-right HUD on desktop — `pointer-events:none` so it never blocks the action buttons, `z-index` below the terminal modal, only the current stage's transmission shown; reverts to in-flow full-width at the bottom of the stage on ≤560px. `script.md` §3 results prose synced to the build copy. No code logic, answers, scope, or audio changed.)
- **Rev 6:** 2026-06-07 (ambient ducking: water/siren loops run at FULL — water 0.55, siren 0.50 — and dip to DUCKED — water 0.20, siren 0.18 — while any voice clip plays, ramping back ~300ms after it ends. Raised from the old static 0.25/0.30 so the improved water bed is clearly audible. Siren stays decoupled from the race timer. No answers, scope, or voice content changed.)
- **Build chat:** Curator's Vault PHASE 1 worker
- **Files in bundle:**
  - `index.html` — the whole app (single self-contained file)
  - `script.md` — Curator voiced lines (export-ready) + on-screen character text + stage-build description
  - `catalog_payload.md` — this file
  - `assets/sfx/`, `assets/voice/` — silent-stub hook targets (Mr. F drops the 15 audio files in)
  - `/applet/` — does NOT exist this phase (§3a Hook-only); future vendored Mode-A applet lands here
- **Pipeline config:** `REPORT_MODE='local'` (demo-safe default); `PIPELINE_URL` placeholder for Mr. F to paste the Apps Script web-app URL. Events: `id_submitted`, `stage_complete` (×3), `level_complete`. Team-level payload.

---

## BUILD_RULES_DELTA (flagged for next consolidation — NOT applied by this build)

Escape rooms are a new artifact with no `Escape_Room_Conventions` doc. The following recurred and may warrant a future conventions entry. Manager/consolidation decides; nothing applied here.

1. **Dark-skin carve-out vs. cream-applet rule.** Visual_Conventions §6.1 locks applet backgrounds to cream/white. The escape room is deliberately DARK (Vault skin); the cream rule governs standalone applets, and the *embedded* Mode-A applet (when vendored) stays cream. Sanctioned by the frozen kickoff (higher precedence). Candidate: a Visual_Conventions §6.1 carve-out or an Escape_Room_Conventions palette section.

2. **Path scheme — 3-level escape-room handle.** NAMING_RULES.md / Applet_Conventions §2.1 use a 4-level path (`discipline/domain/subtopic/slug`) and the locked math domains list has no `escape`. The frozen handle is 3-level (`math/escape/curators-vault/`). Built to the kickoff (precedence); flagged so escape rooms get an explicit path-scheme entry.

3. **Found-note (Kai) card pattern.** A reusable "found-note" hint-card style — tilted paper panel, drop shadow, taped/torn edge, teal accent edge, faint rule-lines, legible system font (NO handwriting font, NO web fonts). Differentiates a character by card design, not handwriting. Candidate for Visual_Conventions §9 character-styling or an Escape_Room_Conventions UI section.

4. **Silent-stub audio pattern + single voiced-character channel.** `playSound`/`playVoice` load `/assets/<bucket>/<name>.mp3`, silently no-op if absent, unlock on first user gesture, with a global mute and loop handling (`siren`/`water`, water auto-started as ambient). Rev 1 adds a **single voice channel**: one voiced character is ever audible at once (previous clip stopped before the next), and automatic transitions sequence on the clip's `ended`/`error` event with a fallback timeout so missing files never hang. Recurs across any audio-bearing module with a single narrator; candidate for Applet_Conventions or Escape_Room_Conventions.

8. **Narrative-scaffold (briefing) screen + dark/cream skin handoff.** A dark briefing screen between the cream FMP entry and the dark play area sets scenario, introduces the voiced + text characters, and is the deliberate cream→dark "powers on" transition. Recurs for any story-framed module; candidate for an Escape_Room_Conventions flow section.

9. **Per-panel hints, no limit (monitored-not-graded).** Contextual hints attached to each puzzle panel rather than one-per-stage, unlimited, **sigma-distance only — never the percentage or the answer** (Rev 2: a hint restores the first move and makes the student finish the conversion). Candidate for an Escape_Room_Conventions / Applet hint-pattern entry.

10. **Radio "incoming-transmission" text treatment + reliable replay.** A non-voiced character whose lines arrive as radio messages: uppercase tag, pulsing icon, left border + tint, and a short arrival jitter (visual only — no audio static, no `navigator.vibrate`), with a documented hook for an optional CC0 crackle SFX. Rev 2.1 adds the load-bearing detail: a CSS animation on a base class will not replay when an element is later shown, so the reveal helper sets it visible, removes the class, forces a reflow (`void el.offsetWidth`), then re-adds it — the jitter fires on every reveal. Generalizable to any element animated on show. Candidate for Visual_Conventions / Escape_Room_Conventions.

11. **On-screen text = opening of the voiced line.** *(Superseded by Rev 3 — see #14.)* Earlier convention that a caption was the opening substring of the spoken clip.

12. **Art-integration with graceful fallback.** Background image + dark scrim behind dark scenario screens; character portraits woven beside speech/hint/transmission blocks; every `<img>` carries an `onerror` that hides itself so a missing asset degrades to the existing text-only styling — no broken-image icons, no layout collapse (flex `gap` ignores removed items). Reusable across any art-bearing module. Candidate for an Escape_Room_Conventions / Visual_Conventions art section.

13. **Vertical "ascent" map + rising-water mechanic.** A bottom-to-top door map (deepest/most-flooded at the bottom, climb out floor by floor) with a ladder rail, and a translucent water layer that rises per stage (Level 1 ends waist/chest, not the top, reserving headroom for the cross-level logic that climbing drops the water). Atmospheric, never a fail-state, never reduces legibility. Candidate Escape_Room_Conventions structure/mechanic entries.

14. **Verbatim caption rule (RETIRES the paraphrase/echo rule).** A voiced character's on-screen caption is now a word-for-word copy of the spoken clip, typewriter-revealed on the single voice channel. Replaces the Rev-2 "opening-substring echo." Flagged so any future voiced module keeps caption text and recorded audio identical, and updates both together.

15. **Two voiced characters on one channel (Custodian-as-judge).** A second voiced character (the Vault Custodian — cold "verify/incorrect" judge) shares the single voice channel with the narrator (Curator): any `playVoice` stops the prior clip, so across the full run only one voice is ever audible (intro Curator → cast Custodian → map Custodian → stage Curator → wrong-answer Custodian → completion Curator). The wrong-answer voice is **debounced ~2s** so rapid submissions don't machine-gun it (text still updates each time). Reusable pattern for any judge/narrator pairing. Candidate Escape_Room_Conventions audio entry.

16. **Voice hook on an otherwise-silent screen + visible speaker source.** Adding a voice clip to a screen that had none (the map) pairs it with a small "transmitting" speaker label + emblem so the audio has a visible source, shown only while the clip plays (hidden on the clip's end event and on any screen change). Generalizable. 

17. **Ambient siren decoupled from the race timer.** Continuous flood ambience (siren + water loops) runs the whole session independent of the optional race timer; the timer is signalled only by its on-screen countdown. Separates "atmosphere" from "mechanic." Candidate Escape_Room_Conventions audio entry.

18. **Fixed-HUD transmission (mobile reverts to flow).** A persistent side message (Amara's radio) that floats as a `position:fixed` lower-right HUD on desktop with `pointer-events:none` (so it overlays without ever blocking the underlying action buttons) and `z-index` below any modal, then reverts to a normal in-flow full-width block at ≤560px (a fixed overlay would cover the puzzle on a phone). Solves the "right column has no room beside full-width cards" problem without squeezing content. Candidate Escape_Room_Conventions / Visual_Conventions layout entry.

19. **Ambient ducking under voice.** Looping ambience runs at a FULL level and dips to a DUCKED level (with a short ~300ms volume ramp) whenever a voice clip plays, restoring when the last voice ends — driven off the same single-voice-channel start/fin path, with a "cancel" hook that neutralizes a superseded clip so a cut line never restores or fires a stale callback. Keeps ambience present without burying narration. Candidate Escape_Room_Conventions audio entry.

5. **Report-mode flag + team-level pipeline payload.** `REPORT_MODE = 'live'|'local'|'off'` with fire-and-forget POST; team-level (not per-student) events `id_submitted` / `stage_complete` / `level_complete`. Generalizes the team-competition pattern (Applet_Conventions §5.10) to monitored-but-not-graded escape rooms. Candidate for an Escape_Room_Conventions reporting section.

6. **Multi-lock stage + cooperative "all-must-agree" gate.** State-machine pattern: independent locks within a stage, any order, stage advances only when all are correct; per-lock targeted feedback (e.g., Gamma's 98/95 diagnostic nudges). Recurs for any cooperative puzzle stage. Candidate for an Escape_Room_Conventions engine section.

7. **Hook-only integration seam.** Build + test an integration point (terminal bezel + open/close + offline state) with a single named mount point (`#terminal-screen`) so a deferred dependency (vendored Mode-A applet) drops in later through a proven seam, rather than untested. Candidate engine pattern.
