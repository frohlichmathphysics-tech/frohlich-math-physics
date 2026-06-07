# script.md — The Curator's Vault (Level 1)

**Product:** Mr. Frohlich Math and Physics · IB MAI SL · Topic 4.9 (Normal Distribution) capstone escape room
**Folder:** `math/escape/curators-vault/` · **Phase 1 · Rev 4 (2026-06-06)**
**Purpose:** the human-authored content lives here, outside `index.html`, so it survives code edits, review, and asset regeneration — and so a future Levels-2/3 builder understands the flow without reading the JS.

Holds: (1) Curator voiced lines (export-ready, now also the verbatim on-screen captions), (2) all on-screen character text, (3) the stage-build description.

> **Rev 3 (art + story + structure):** archive **background** image + dark scrim behind the scenario screens; **dark ID gate** with empty fields (no example placeholders); **two-screen intro** (world+mission, then cast) replacing the single briefing; **verbatim** Curator captions (the paraphrase/echo rule is retired); **portraits** woven in (Curator beside her speech block, Amara in the radio, Kai on hint cards, Custodian on each stage's context block); **bigger pulsing radio** (34px icon + breathing body + portrait, arrival jitter kept); **vertical bottom-to-top map** (climb out floor by floor); **rising water** per stage ending waist/chest in Level 1; **dark results** that open Vault Two. All images degrade gracefully (missing file → text-only, no broken icons). Seven answers and Empirical-Rule scope unchanged.
>
 > **Rev 4 (Custodian voice + polish):** the **Vault Custodian is now voiced** (`custodian_cast` on the cast screen, `custodian_map` on the map, `custodian_wrong` on wrong answers) on the SAME single voice channel as the Curator — the two never overlap. Wrong answers are the Custodian's job now (the Curator's `curator_wrong` is **retired**, never played); the Custodian voice is debounced ~2s. Kai hints use the words "standard deviation(s)"/"mean" (no "sigma"/"mu"). Amara's radio is re-anchored as a **right-side vertical block**. The **siren loops continuously** as flood ambience, decoupled from the race timer (timer is shown only by its countdown). Results narrator paragraph rewritten for the bottom-to-top ascent (her spoken caption unchanged).
>
> **Preserved from earlier revisions:** single Curator voice channel + sequencing; input-overflow fix; sigma-distance-only Kai hints (sketch shows σ bands, no percentages); Stage-3 per-dial Set; radio arrival jitter re-fired via reflow; water ambient auto-start; per-panel hints, no limit.

---

## Art assets (Mr. F supplies → `assets/img/`; missing files degrade gracefully)
`bg-archive.png` (background, shelves frame edges) · `curator.png` · `amara.png` · `kai.png` · `custodian.png` (bell-curve sigil). A `#bg-scrim` (rgba ≈ 0.46–0.74 dark) sits between the background and all panels so text always reads. The ID gate is its own solid dark screen (no archive background).

---

## 1. Curator voiced lines = on-screen captions (VERBATIM)

Voiced character = the Curator ONLY. Mature female, warm/patient/steady. Generate all clips in one ElevenLabs session with identical settings. No Greek glyphs spoken. Single voice channel — only one Curator line audible at once; the typewriter caption shows the **same words** as the clip that is playing. `curator.png` sits beside her amber speech block everywhere she speaks (intro, every stage reveal/solve, complete). Save each as `assets/voice/<filename>.mp3`.

| Filename | Plays when | Line (this is also the verbatim on-screen caption) |
|---|---|---|
| `curator_intro.mp3` | intro screen 1 | Welcome. I am the Curator. Long ago I gathered the world's weather into this archive — every rainfall, every harvest, every quiet record of a changing climate. Three doors stand between you and those records. I sealed them myself. Open them, and what I preserved is yours to save. |
| `curator_stage1.mp3` | Stage 1 reveal | The first door remembers the rain. Read the pattern as I taught it — the heart of the data, and how far it strays — and the dial will turn. |
| `curator_stage1_solved.mp3` | Stage 1 solved | Just so. The monsoon keeps its rhythm, and so do you. Proceed. |
| `curator_stage2.mp3` | Stage 2 reveal | Three stations, three measures — temperature, soil, and grain. Each waits for a true answer. Divide the work among you, or face them together. The door cares only that all three agree. |
| `curator_stage2_solved.mp3` | all three Stage-2 padlocks correct | All three, in agreement. You begin to see the shape beneath the numbers. |
| `curator_stage3.mp3` | Stage 3 reveal | One door remains. It guards not the world's climate, but this room's own air. Tell me how often each setting must wake, and the vault will yield. |
| `curator_complete.mp3` | results screen | The first vault is open. The records breathe again. You have earned what lies within — but deeper doors remain, and they do not ask such gentle questions. Rest. Then return. |
| `curator_wrong.mp3` | **RETIRED in Rev 4** — no longer played or captioned (wrong answers are the Vault Custodian) | — |
| `curator_idle.mp3` | optional ambient (hook available; not auto-wired) | Take your time. The data has waited a century; it can wait a moment more. |

### Vault Custodian — voiced judge (Rev 4). Cold/system register, distinct from the Curator. On the SAME single voice channel (never overlaps the Curator). Save to `assets/voice/`.

| Filename | Plays when | On-screen text |
|---|---|---|
| `custodian_cast.mp3` | intro Screen 2 (the cast) appears | none separate — the cast cards carry the same info (a small "VAULT CUSTODIAN · transmitting" label shows while it plays) |
| `custodian_map.mp3` | the map screen appears (new voice hook; same map, no new screen) | `custodian.png` emblem + "VAULT CUSTODIAN · transmitting" label while it plays |
| `custodian_wrong.mp3` | every wrong answer (voice debounced ~2s; text updates every time) | per lock — see Custodian wrong-answer text below |

**Custodian wrong-answer text** (cold register; the checker still accepts ONLY 97 for Gamma, 98/95 stay diagnostic and non-failing):
- generic wrong: "Incorrect. The lock holds."
- Gamma 98: "Incorrect. The exceptional years — beyond three standard deviations — are not 'neither'. Remove that tail as well."
- Gamma 95: "Incorrect. The upper limit is three standard deviations above the mean, not two."

**Correct answers:** per-lock "Verified." text flash + the existing `unlock` SFX only — no Custodian voice. Stage-complete still triggers the Curator's stage-solved line.

---

## 2. On-screen character text (styled, never voiced except the Curator)

### Intro — Screen 1 (world + mission)
- **Setup (narrator):** "Deep beneath the monsoon coast lies the Curator's Archive — a century of the world's climate, recorded and sealed. The Curator vanished years ago, leaving the records behind three locked vault doors. Tonight the monsoon has breached the lower levels, and the water is rising."
- **Mission (petrol callout):** "You and your team are descending to the lowest vault to rescue the records — the first of three sealed doors. Deeper vaults remain below. Open this one before the archive floods." (Does not say what Vaults Two/Three contain.)
- **Curator block (amber + `curator.png`):** plays `curator_intro`; caption = the verbatim intro line.
- **Button:** "Continue →" → Screen 2.

### Intro — Screen 2 (the cast, with portraits)
- **Curator** (`curator.png`): "The archive's founder. She sealed the records behind three doors before she vanished — and her voice still guides the vault."
- **Dr. Amara Osei** (`amara.png`): "Climatologist, on the radio above — tracking the water and keeping the time."
- **Kai** (`kai.png`): "A junior archivist who left in a hurry when the water came, scattering notes through the vaults. Stuck on a lock? Ask Kai."
- **The Vault Custodian** (`custodian.png`): "The archive's gatekeeper. It poses each vault's lock and opens only for a correct answer."
- **Button:** "Enter the Archive →" → map. (Water ambient loop starts on entering the intro.)

### Vault Custodian — clean on-dark text, with `custodian.png` emblem on **each stage's** context block (once per stage, on the panel stating the distribution).
- **Stage 1:** "Kerala monsoon rainfall is normally distributed." · `mean μ = 290 cm · standard deviation σ = 15 cm`
- **Stage 2 header:** "Three climate stations. Three padlocks. Solve them in any order — the door opens only when all three agree."
  - Alpha: "Kerala daily April temperature · μ = 33°C · σ = 2°C · n = 400 days"
  - Beta: "Andean potato mass per plant · μ = 1.8 kg · σ = 0.3 kg"
  - Gamma: "Sahel millet yield · μ = 800 kg/ha · σ = 60 kg/ha · n = 100 years · failure < 680 · exceptional > 980"
- **Stage 3:** "The vault's own air. Relative humidity is normally distributed over the monitoring period. A dehumidifier has three fan speeds — tell the Curator how often each must wake." · `μ = 45% · σ = 5% · n = 10,000 hours`

### On-screen prompts (questions)
- **S1:** "The middle 95% of years fall within a predictable band. Set the dial to the **lower bound** of that band, in cm."
- **Alpha:** "Approximately how many of the 400 days had a temperature **above 37°C**?"
- **Beta:** "What **percentage** of plants produce between 1.2 kg and 2.4 kg?"
- **Gamma:** "In 100 years, approximately how many were **neither** a failure year **nor** an exceptional year?"
- **Dial 1/2/3:** Low (μ−σ to μ+σ) / Medium (μ+σ to μ+2σ) / High (beyond μ+3σ) — hours out of 10,000.

### Kai — found-note cards with `kai.png` on the card header. Per-panel in Stage 2; no limit. **Standard-deviation-distance only — never a percentage**, and worded as "standard deviation(s)"/"mean" (no "sigma"/"mu") in the prose hints (the sketch axis still uses σ marks).
- **S1:** "The middle 95% — how many standard deviations either side of the mean is that? Set the dial to the lower edge."
- **Alpha:** "How many standard deviations above the mean is 37 degrees? That tells you which slice of the 400 days you need."
- **Beta:** "How many standard deviations from the mean are 1.2 and 2.4? The rule does the rest."
- **Gamma:** sketch of the sigma bands only — μ, ±1σ, ±2σ, ±3σ, **no percentage labels** — plus: "How many sigma is each limit — and are they the same? One's a 2-sigma edge, one's a 3-sigma edge."
- **S3:** "Each fan's band is measured in whole sigma. Name the band in sigma first, then the rule gives the share."

### Dr. Amara Osei — text-only radio, a **right-side vertical block** (Rev 4): `amara.png` on top, the "INCOMING TRANSMISSION · DR. OSEI" tag and message below, in a narrow right-margin column that never overflows (stacks full-width on phone). 34px pulsing radio icon; the body text and portrait breathe in sync; a 0.45s arrival jitter (`radioIn`) re-fires every time a stage opens (via `showRadio()` reflow). Visual only — no audio static, no haptics; a code hook is left for an optional CC0 crackle. One per stage, after the Curator line.
- **Stage 1:** "Osei here — I'm topside. Water's at the lower stacks already. First door's on you; I'll keep time."
- **Stage 2:** "It's still rising — mid-archive now. Three locks at once; split up if you have to. Keep moving."
- **Stage 3:** "Last door. Water's near the records — whatever the dials need, set them now. You're almost out."

---

## 3. Stage-build description (flow, locks, answers, hooks)

**Flow:** ID gate (dark) → intro screen 1 (world + mission) → intro screen 2 (cast) → **vertical map** → enter Level 1 → Stage 1 → Stage 2 → Stage 3 → Vault Door 1 opens → results (dark, opens Vault Two) → map (Door One = Opened, Door Two = Next ascent).

**Map (bottom-to-top):** doors stacked vertically with a ladder rail — Door Three (Upper vault) at top, Door Two (Mid vault) middle, Door One (Lowest vault · most flooded) at the bottom, where the team starts and climbs out. Door One = Enter; Door Two = Coming soon (becomes "Next ascent" after Level 1); Door Three = Locked.

**Rising water (vault only):** a translucent blue layer fixed at the bottom of the vault, rising per stage — Stage 1 ≈ 12vh (ankle/shin), Stage 2 ≈ 30vh (knee/thigh), Stage 3 ≈ 52vh (waist–chest, **not** the top, since Level 1 is the deepest/most-flooded vault and the records aren't ruined). Behind the panels, faint surface shimmer; never reduces legibility; not a fail-state. (Later-level logic, not built now: climbing a floor for Level 2 drops the water back down.)

**Every lock CODE *is* the mathematical answer** (exact-match integers; answers never shown in student-facing text).

| Stage / lock | Reduces to | Answer | Reveal | Solve |
|---|---|---|---|---|
| S1 Rainfall Dial | μ − 2σ = 290 − 30 | **260** | `curator_stage1` + Amara S1 + water→12vh | `unlock` → `curator_stage1_solved` → (sequenced) Stage 2 |
| S2 Alpha | beyond μ+2σ → 2.5% × 400 | **10** | `curator_stage2` + Amara S2 + water→30vh | `unlock` |
| S2 Beta | within ±2σ → 95% | **95** | — | `unlock` |
| S2 Gamma | 100 − 2.5 − 0.15 = 97.35 ≈ | **97** | — | `unlock`; all three → `curator_stage2_solved` → Stage 3 |
| S3 Dial 1 / 2 / 3 | 68% / 13.5% / 0.15% × 10,000 | **6800 / 1350 / 15** | `curator_stage3` + Amara S3 + water→52vh | per-dial `unlock` + "Set"; all set → enable **Open Vault Door One** → `stage_clear` + door animation → results + `curator_complete` |

**Gamma feedback (accepts ONLY 97; 98 and 95 are diagnostic, non-failing):**
- **98** → "Close — but the exceptional years (above three sigma) are NOT 'neither'; they have to come out too. You've removed the 2.5% of failure years, but not the rare 0.15% of exceptional years. Subtract BOTH tails." (98 = 100 − 2.5)
- **95** → "Check the upper limit: 980 is THREE sigma above the mean, not two — so the exceptional tail is 0.15%, not 2.5%." (95 = 100 − 2.5 − 2.5)

**Results (dark, opens Vault Two):** `curator_complete` plays with the verbatim caption + portrait. Narrator copy: "Vault One's records are safe — but they're only the lowest level. The Curator sealed the archives on the floors above, and the water is still rising. Climb to Vault Two." (Curator's spoken caption unchanged.) Shows team name + time-in-vault. Button "Back to the archive map" returns to the map, where Door Two now reads "Next ascent."

**Audio / pipeline / terminal:** single Curator voice channel; SFX may overlap; water AND siren loop continuously as flood ambience from the intro until the results/door-complete screen (siren is decoupled from the race timer; siren volume moderate). The race timer is off by default and shown ONLY by its countdown; expiry = no fail ("Continue anyway"). Wrong answers play the Vault Custodian (debounced ~2s); correct answers play the `unlock` SFX only. Pipeline events `id_submitted` / `stage_complete`×3 / `level_complete`, team-level payload, `REPORT_MODE='local'` default. Archive Reference Terminal is Hook-only (a "TERMINAL OFFLINE" bezel; `#terminal-screen` is the drop-in mount for the future vendored Mode-A applet in `/applet/`).
