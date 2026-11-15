# Lumid Evo · Post 1 · Illustration prompts

Carousel: "What is Evo" (Figma section `Lumid Evo · Post 1 · v7`, 6 slides, 1080×1350).
Style base: [illustration-prompt.md](./illustration-prompt.md).

## Where the illustration goes

Every slide has the same layout: headline on top, then the green **Field** card (x 40–1040, y 560–1230) with a frosted card at top-left (x 80, w 510) and the phone at right (x 620). The illustration fills the **empty bottom-left of the Field**, between the frosted card and the Field's bottom edge, and faces right toward the phone.

| Slide | Message | Free zone (x 56–640) | Pose |
|---|---|---|---|
| 01 Hook | Stuck on something? Find the cause. | y 870–1230 (≈360 high) | full body |
| 02 Problem | A bad mock. A pile of deadlines. | y 840–1230 (≈390) | full body |
| 03 How it works | Four steps, every single time. | y 895–1230 (≈335) | full body |
| 04 See it | It listens first, then it solves. | y 975–1230 (≈255) | seated, cropped by bottom edge |
| 05 Five minutes | Every fix starts with five minutes. | y 785–1230 (≈445) | full body |
| 06 Coming soon | For students, aspirants, professionals. | y 995–1230 (≈235) | waist-up group, cropped by bottom edge |

The Field is green, so characters wear **cream and ink**. Lime is used only for accents; a lime jacket would disappear into the background.

## 1. Style block (start of every prompt)

```
Flat editorial character illustration, risograph print look with fine grain and light halftone texture, slight ink misregistration. Exaggerated proportions: small head, long body, oversized hands, oversized chunky sneakers, wide dynamic stance with a strong diagonal. Bold solid fills, almost no outlines; thin ink lines only for clothing folds, fingers and shoe details. Oversized boxy clothes. Minimal face: dot eyes, small nose, simple mouth.
Palette, no other colours: cream #F6F8F2, pale lime #E4F7D6, lime #BDF71E, mid lime #9AD61A, deep green #1E7A08, forest #242E21, ink #151A13, warm peach skin #F08A5D shaded #B4532A, one tiny lavender #5B3FC4 accent.
Clothes are mostly cream and ink so the figure reads on a green background; lime only for accents.
Isolated on a plain flat pale sky-blue #A9DDF7 background for background removal. No scenery, no floor line, only a tiny contact shadow. No text, letters, numbers, logos or watermarks.
```

## 2. Character block (same text on every slide)

```
Main character "Alex": Indian college student around 20, short messy dark hair as one solid ink shape, oversized cream hoodie with pale-lime shading and a lime drawstring, ink-black wide-leg trousers with forest folds, chunky sneakers with deep-green uppers, bright lime soles and cream laces, a thin lavender watch.
Evo: a small flat lime orb (two flat tones, not glossy, no face, no limbs) with a deep-green four-point sparkle star in its centre, floating.
```

## 3. Scene per slide

Each full prompt is the style block, then the character block, then one scene below, then the negative prompt.

**01 Hook: Stuck on something? Find the cause.**
```
Scene: Alex sits slumped on a tall wobbly stack of thick textbooks, knees up, forehead resting in one oversized hand; the other hand dangles a crumpled test paper with a big circled scribble mark. Above their head floats a tangled ink-black scribble knot. Body turned toward the right, eyes glancing right.
Framing: full body, landscape 3:2, figure in the left two-thirds, right third empty.
```
In Figma: write "48" on the paper (it matches the chat quote).

**02 Problem: A bad mock. A pile of deadlines. Nobody helps with that.**
```
Scene: Alex mid-stumble, leaning back, arms overloaded with three things: a crumpled test paper, a thick stack of calendar pages with torn sheets flying away, and a speech bubble taped shut with an X of tape. One sneaker lifted off the ground, papers fluttering around, eyebrows raised, overwhelmed.
Framing: full body, landscape 3:2, figure in the left two-thirds.
```
The three items match the three UNSOLVED rows on the frosted card.

**03 How it works: Four steps, every single time.**
```
Scene: Alex climbs a staircase of four chunky blocks rising from left to right, mid-stride on the second block, one hand reaching forward. Blocks are cream, pale lime, lime and deep green, each with a blank flat front face. The Evo orb floats just above the top block, waiting.
Framing: full body, landscape 3:2, the top step reaches the right edge.
```
In Figma: put 01–04 on the block faces.

**04 See it: It listens first, then it solves.**
```
Scene: Alex sits cross-legged, talking and gesturing with both open hands, calm slight smile. From their mouth a tangled ink scribble ribbon flows right into the Evo orb and comes out the other side as one smooth straight lime line pointing right.
Framing: wide 2:1, seated figure cropped at the hips by the bottom edge.
```

**05 Five minutes: Every fix starts with five minutes.**
```
Scene: Alex kneels on the floor writing fast on a big notepad with an oversized pencil, focused, tongue slightly out. Crumpled paper balls arc over their shoulder into a small basket. Beside them a giant chunky stopwatch with a lime wedge filling the first part of a blank dial.
Framing: full body, landscape 3:2.
```

**06 Coming soon: For students, exam aspirants and young professionals.**
```
Scene: three young people walking in stride to the right, confident and upbeat, with the Evo orb floating ahead leading them:
1) Alex with a cream backpack;
2) an exam aspirant with a long dark braid, cream kurta-length top over ink trousers, hugging a tall stack of prep books tied with a lime strap;
3) a young professional with short curly hair, forest blazer over a lime tee, laptop under one arm.
Framing: wide 2:1, waist-up group, bodies cropped by the bottom edge.
```

## 4. Combined sheet (all six in one generation)

Generating all six scenes together keeps Alex identical across slides. Crop each vignette out afterwards.

```
[Style block]
[Character block]
Layout: one canvas, 3×2 grid of six separate vignettes, equal spacing, no borders, nothing overlapping between vignettes. Identical character design, proportions and palette in every vignette.
1. Alex slumped on a wobbly stack of textbooks, head in hand, holding a crumpled test paper, tangled scribble knot above the head.
2. Alex stumbling backwards, overloaded with a crumpled test paper, flying calendar pages and a speech bubble taped shut.
3. Alex climbing four chunky blocks rising left to right, Evo orb floating above the top block.
4. Alex sitting cross-legged talking; a tangled ribbon from the mouth passes through the Evo orb and exits as a straight lime line.
5. Alex kneeling, writing on a big notepad with an oversized pencil beside a giant stopwatch with a lime wedge; paper balls flying into a basket.
6. Alex, an exam aspirant hugging prep books and a young professional with a laptop walking together to the right, Evo orb leading.
All figures face or move toward the right.
```

## 5. Negative prompt

```
photorealistic, 3D render, glossy, gradients, neon glow, thick black outlines, anime, chibi, realistic proportions, background scenery, floor, text, letters, numbers, logos, brand swooshes, watermark, extra fingers, blue clothes, red, orange clothes, purple dominant, lime jacket
```

## 6. Putting it into the slide (Figma)

1. Remove the sky-blue background, then vectorise (6–8 colours) to snap fills to the exact hex values.
2. Place the illustration inside `Field (v4)` **below the `Grain` layer** so the Field grain covers it, and **below the frosted card and phone**, so the character sits behind the UI.
3. Bottom-align to the Field edge (y 1230) inside the free zone above. On 04 and 06 let the Field clip the lower body so the figures rise from the bottom edge.
4. Add a contact shadow under each figure: ellipse, ink #151A13 at 12%, blur 20.
5. Keep the figures out of the headline area and below-Field footer.

## 7. Animation (video slides)

Instagram carousel slides can be MP4: 1080×1350, H.264, 30 fps, 4 s seamless loop, ease `cubic-bezier(0.2, 0, 0, 1)` (`--ease-out-evo`).

For rigging, generate one **Alex body-part sheet** (variant 4B in [illustration-prompt.md](./illustration-prompt.md)) and reuse it on every slide. Generate each slide's props as a separate prop sheet (variant 4D).

| Slide | Motion |
|---|---|
| 01 | Scribble knot slowly rotates, book stack wobbles 1–2°, slow sigh (shoulders rise and fall) |
| 02 | Calendar pages peel off and float away on a loop, body sways to keep balance, taped bubble jitters |
| 03 | Step cycle up the blocks; blocks pop in 01→04 in sync with the frosted-card list; orb bobs, sparkle twinkles |
| 04 | Ribbon draws on (trim path): tangled in, straight out; orb pulses as the ribbon passes through; hands gesture |
| 05 | Stopwatch wedge sweeps, pencil scribbles, one paper ball arcs into the basket per loop |
| 06 | Figures rise in from the bottom edge (stagger 120 ms), then walking bob loop with the orb leading |
