# slide-mode-c.md

> **Part B LM slide-build description and draft TTS narration for Mode C of the master applet (`invNorm`), Lesson 4.9.3.**
> Built by applet worker. **Stage-2 lesson worker expands.**
> ⚠️ Exploration prompts below are **worker-drafted from canon §7.1 pedagogical beats** — canon §7.4 is applet spec only, no prompts. Lesson worker treats as a starting point.

---

## Slide-build description (host: Part B LM, Lesson 4.9.3)

**Slide title:** *Explore invNorm — finding a cutoff value from a probability*

**Layout (16:9, landscape):**
- **Left two-thirds:** embedded applet iframe.
  - Source: `https://frohlich-math-physics.netlify.app/math/probability/normal-distribution/?mode=C`
  - Iframe dimensions: 720 × 540 px (4:3, same as Mode B).
  - Cream background blends with slide.
- **Right one-third:** four numbered exploration prompts. **Worker-drafted:**
  1. **Set μ = 50, σ = 10** (already the default). Drag the single line left and right. What does the left-tail area do as you move it past μ?
  2. **Type 0.10** into the Target left-tail area box. What x-value does the line snap to? Verify against the Empirical Rule: μ − ~1.28 σ — does the position roughly match?
  3. **Gecko problem** (canon §7.3 P1): use the Advanced panel to set μ = 8.4, σ = 1.1. Type **0.10** into the area box. The readout should show **x ≈ 6.99 cm** — the bottom 10 % cutoff.
  4. **Click "Flip to right tail"**. The helper line shows the conversion: right-tail area → left = 1 − right. For the "top 5 %" cutoff at μ = 420, σ = 28 (canon §7.3 P5 burrito), what target area do you type? *(Answer: 0.95 — because invNorm always takes left-tail area.)*
- **Bottom strip:** thin reminder line — *"The right-tail toggle is a visual aid — the invNorm formula always uses the LEFT-tail area. The helper line teaches you the conversion."*

**Companion static figures:** *(suggested)*
- Small inset showing the relationship `top p % ↔ left area = 1 − p`. Could be a paired-circle Venn-style sketch, or two small bell curves with shaded halves. Lesson worker decides.

---

## Draft TTS narration (voice flag: **Victoria Natural**)

> *Target length: about 50 to 65 seconds.*

```xml
<speak>
Mode C does the inverse problem. Probability in, x-value out.
<break time="500ms"/>
One line on the curve. Drag it, and the left-tail area updates live, to three significant figures.
<break time="500ms"/>
The dual-syntax panel below shows what you would type on the T I eighty-four or T I N spire to get the same answer. The function is called invNorm — capital I N V, capital N o r m — and it takes three arguments: left-tail area, mu, sigma.
<break time="600ms"/>
Real problems rarely give you "left-tail area" directly. They say "top five percent" or "bottom ten percent". Click the "Flip to right tail" button and you will see a helper line appear: right-tail equals p, so left equals one minus p. That is the conversion you do in your head — or on paper — before invNorm even gets involved.
<break time="600ms"/>
Try the four prompts. Prompt three is the gecko problem from your worksheet. Prompt four is the burrito problem. Both reduce to the same move: figure out the LEFT-tail area, then ask invNorm for the cutoff.
<break time="400ms"/>
One trap to watch: typing a right-tail percentage straight into the box gives you the wrong answer. Always convert first.
</speak>
```

**Alt-narration variant (≈ 30 seconds, trimmed for shorter clip 1):**

```xml
<speak>
Mode C reverses the question. Type a left-tail area, get the x-value.
<break time="400ms"/>
Drag the line, or type a target area, and watch the readout. The dual-syntax panel shows the T I eighty-four and T I N spire formulas in real time.
<break time="500ms"/>
Click "Flip to right tail" when the problem talks about "top" or "bottom" percentages. The helper line teaches you the one-minus-p conversion that invNorm needs.
</speak>
```

---

## Notes for Stage-2 lesson worker

- **Exploration prompts 1–4 are worker-drafted** (canon §7.4 lacks prompts). Lesson worker may rewrite — treat as scaffolds.
- The right-tail toggle is **visual only** — the dual-syntax formula always shows `invNorm(area, μ, σ)` with `area` = left-tail probability. This is intentional: both TI-84 and TI-Nspire accept left-tail input, and asking the student to do the `1 − p` conversion mentally is the actual pedagogical point of Lesson 4.9.3 Beat 3. **Do not rewrite the narration to suggest the calculator accepts right-tail directly.**
- Helper line text in Mode C: *"right-tail area = [p] → left area = 1 − [p] = [1−p]"*. Same notation pattern as canon §7.4. If lesson worker wants to add additional explanatory text alongside, fine, but keep the helper-line itself succinct.
- **TI-Nspire syntax** in the applet uses **μ-before-σ**, same as TI-84 — verified on hardware (see worker-summary).
- If the practice WS for 4.9.3 includes the gecko or burrito problems, **prompts 3 and 4 are worked-example previews**. Don't reuse them as the slide's first worked examples — pick from the remaining canon §7.3 problems instead.
