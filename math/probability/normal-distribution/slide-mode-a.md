# slide-mode-a.md

> **Part B LM slide-build description and draft TTS narration for Mode A of the master applet (Empirical Rule visualisation), Lesson 4.9.1.**
> Built by applet worker. **Stage-2 lesson worker expands** — these are usable drafts, not finals.

---

## Slide-build description (host: Part B LM, Lesson 4.9.1)

**Slide title:** *Explore the normal curve*

**Layout (16:9, landscape):**
- **Left two-thirds:** embedded applet iframe.
  - Source: `https://frohlich-math-physics.netlify.app/math/probability/normal-distribution/?mode=A`
  - Iframe dimensions: 720 × 432 px (5:3 aspect-ratio to match canvas).
  - No frame border. Cream background blends with slide.
- **Right one-third:** four numbered exploration prompts, stacked vertically. Each prompt is a single short instruction. Worker uses these verbatim from canon §5.4:
  1. **Set μ = 50, σ = 10.** Sketch (or screenshot) the curve.
  2. **Move σ to 5.** What changed? **Move σ to 20.** What changed?
  3. **Set μ = 100, σ = 15** (IQ scenario). What's the range that contains 95 % of values?
  4. **Click "Show 68 / 95 / 99.7 % regions"** to verify your answer to prompt 3.
- **Bottom strip:** thin reminder line — *"Use the Advanced panel (μ, σ) — already open by default in Mode A."*

**Companion static figures:** none. The applet is the figure.

**Cartoon beat:** none on this slide. (LaunchPeak appears on the Beat-5 slide that introduces the Empirical Rule earlier in Part B; see canon §10.5 Cartoon beat A.)

---

## Draft TTS narration (voice flag: **Victoria Natural**, strong human-speech simulation)

> *Math symbols spelled out longform: "mu", "sigma", "sixty-eight percent" etc. SSML tags conservative — Victoria Natural already does most of the prosody; over-tagging hurts more than helps. Audio length target: about 35 to 45 seconds.*

```xml
<speak>
Time to play with the normal curve directly.
<break time="400ms"/>
On the left you can see a smooth bell-shaped curve. Two sliders, mu and sigma, let you reshape it.
<break time="500ms"/>
Mu — the mean — slides the whole curve left and right. Sigma — the standard deviation — controls how wide or narrow the bell is.
<break time="600ms"/>
Try the four prompts on the right. Take a screenshot when one of them surprises you, and bring it to class.
<break time="500ms"/>
Prompt four — Show 68 / 95 / 99.7 percent regions — lights up the Empirical Rule on the curve so you can check your guess against the rule directly.
<break time="400ms"/>
There is no right answer to find here. The point is to feel how mu and sigma drive the shape, before we let the calculator do the heavy lifting in the next lesson.
</speak>
```

**Alt-narration variant (shorter, ≈ 20 seconds — for trimmed clip 1 of Part B):**

```xml
<speak>
Two sliders. Mu slides the curve. Sigma stretches or squeezes it.
<break time="400ms"/>
Work through the four prompts on the right. The last one — Show 68, 95, 99.7 percent regions — lets you verify the Empirical Rule yourself.
</speak>
```

---

## Notes for Stage-2 lesson worker

- Confirm the prompt text on the right pane matches canon §5.4 verbatim. **If §5.4 is revised**, this slide regenerates.
- The applet defaults to μ = 50, σ = 10 with **ESR labels OFF**. Prompt 4 is the reveal moment. Don't pre-toggle in any static figures the lesson worker generates.
- LaunchPeak does not appear on this slide. If the slide before this one introduces ESR with LaunchPeak (Cartoon beat A from canon §10.5), keep the visual register consistent (cream background, navy/teal palette).
- Mode-A applet has **no calculator readout** — students don't see normalcdf or invNorm syntax in this mode. That's deliberate: simplicity at first encounter (canon §9.1 lock). The dual-syntax debut happens in Lesson 4.9.2 (Mode B).
