# slide-mode-b.md

> **Part B LM slide-build description and draft TTS narration for Mode B of the master applet (`normalcdf`), Lesson 4.9.2.**
> Built by applet worker. **Stage-2 lesson worker expands.**
> ⚠️ Exploration prompts below are **worker-drafted from canon §6.1 pedagogical beats** — canon §6.4 is applet spec only, has no prompts. Lesson worker should treat as a strong starting point, not as canon-locked text.

---

## Slide-build description (host: Part B LM, Lesson 4.9.2)

**Slide title:** *Explore normalcdf — area between two values*

**Layout (16:9, landscape):**
- **Left two-thirds:** embedded applet iframe.
  - Source: `https://frohlich-math-physics.netlify.app/math/probability/normal-distribution/?mode=B`
  - Iframe dimensions: 720 × 540 px (4:3 aspect — Mode B has more controls below the canvas than Mode A, so taller iframe).
  - Cream background blends with slide.
- **Right one-third:** four numbered exploration prompts, stacked. **Worker-drafted (flag for lesson worker):**
  1. **Set μ = 50, σ = 10** (already the default). Drag the **Lower** line to 40 and the **Upper** line to 60. Read off the probability. Does it match the Empirical Rule's 68 % to within rounding?
  2. **Click "Set −∞"** on the lower side. What does the TI-84 readout show in place of −∞? *(Answer: −1E99.)*
  3. **Spice jar problem** (canon §6.3 P1): use the Advanced panel to set μ = 52, σ = 1.8. Click "Set −∞" on lower; type **49** into the Upper input. The readout should show **P ≈ 0.0478**.
  4. **Slide μ around while bounds stay put.** What happens to the probability? *(Answer: it shifts because the curve has moved, but the bounds stayed at the same x-values.)*
- **Bottom strip:** thin reminder line — *"Open the Advanced panel (μ, σ) when you need to change the distribution. Drag the L and U handles, or type values directly."*

**Companion static figures:** *(suggested — lesson worker decides)*
- Tiny side-by-side cartoon (canon §10.5 Cartoon beat B — Calculator order trap) — **OR drop this if v3 canon retires that cartoon beat**, see worker-summary doc proposed canon edit 5.

---

## Draft TTS narration (voice flag: **Victoria Natural**)

> *Target length: about 45 to 60 seconds. Math symbols longform: "mu", "sigma", "normal C D F" (spelled), "minus one E ninety-nine".*

```xml
<speak>
Now the curve gets two friends — Lower and Upper.
<break time="500ms"/>
Drag them along the x-axis. The teal shaded area between them is the probability that X lands inside that interval. The number updates live, to three significant figures.
<break time="600ms"/>
Below the curve you see the same calculation written in two calculator dialects — T I eighty-four on top, T I N spire below. Both use the same argument order: lower, upper, mu, sigma.
<break time="500ms"/>
For a one-sided tail — say, P of X less than forty-nine — click "Set minus infinity" on the lower side. The readout swaps in minus one E ninety-nine, which is how the calculators represent negative infinity in real life.
<break time="600ms"/>
Try the four prompts on the right. Prompt three is a real I B problem — the spice jar question from your worksheet. Use the Advanced panel to set mu and sigma, then drive the bounds the same way.
<break time="500ms"/>
One thing to watch: when you slide mu while the bounds stay put, the curve moves but the bounds do not. The probability changes. That is the same situation as comparing two factories with different means but the same inspection range — you will see this pattern in the practice problems.
</speak>
```

**Alt-narration variant (≈ 25 seconds — trimmed for shorter clip 1):**

```xml
<speak>
Drag the Lower and Upper lines. The shaded area between them is the probability — updated live to three significant figures.
<break time="400ms"/>
For a one-sided tail, use the Set minus infinity or Set plus infinity buttons. The calculator readout below shows the exact syntax you would type on your T I eighty-four or T I N spire.
<break time="500ms"/>
Work through the four prompts. Prompt three is the spice jar problem — match the canon answer of zero point zero four seven eight.
</speak>
```

---

## Notes for Stage-2 lesson worker

- **Exploration prompts 1–4 are worker-drafted** (canon §6.4 has the applet spec but no exploration prompts to mirror canon §5.4's structure). Lesson worker may rewrite freely — these are scaffolds, not locks.
- Mode B boots with **Advanced panel collapsed**. Prompts 3 and 4 require opening it. Either keep that friction (good pedagogy — students see the simple interface first) or note explicitly in the slide text "Open the Advanced panel to change μ and σ."
- **TI-Nspire syntax** in the applet uses **μ-before-σ**, same order as TI-84 — verified on TI-Nspire CX II hardware (see worker-summary doc, May 2026). If the slide includes any static screenshots of `normCdf` syntax, ensure they match: `normCdf(L, U, μ, σ)`.
- The canon §10.5 Cartoon beat B (Calculator order trap) is **slated for retirement** in canon v3 since the σ-before-μ trap turned out to be a documentation error, not a real calculator behaviour. Coordinate with the manager chat before including this cartoon on the slide.
- If the practice WS for Lesson 4.9.2 includes the spice jar problem, **prompt 3 doubles as worked-example preview** — that's intentional. Don't reuse the spice jar as the slide's first worked example.
