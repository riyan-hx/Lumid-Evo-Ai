# EVO Illustration Prompt System

Style reference: chunky, grainy flat-character illustrations (big hands and feet, small heads, dynamic poses, print texture), recoloured to the EVO palette and wellbeing themes.

## 1. Master style prompt (paste first, every time)

```
Flat editorial character illustration, risograph print style with fine grain and subtle halftone texture, slight ink misregistration. Exaggerated proportions: small head, long torso, oversized hands and oversized chunky sneakers or boots, wide expressive stance, strong diagonal motion in the pose. Shapes are bold, simple and solid-filled with almost no outlines; thin dark ink lines only for clothing folds, fingers and shoe details. Clothing is oversized and boxy (puffer jackets, hoodies, wide trousers, blazers). Faces are minimal: dot eyes, small nose, simple smile, calm or focused expression. Hair is a single dark shape.

Strict colour palette, no other colours:
- Background: off-white paper #F6F8F2
- Primary: lime #9AD61A and bright lime highlight #BDF71E
- Secondary: deep green #1E7A08 and mid green #3F8F22
- Dark: forest #242E21 and ink #151A13 (trousers, hair, shadows, linework)
- Warm accent: peach #F08A5D (skin tone and one accent item only)
- Optional single cool accent: lavender #5B3FC4 OR sky #245DB8, used on max one small item
Skin uses peach #F08A5D with darker peach shading #B4532A.
Each character uses at most 5 colours. Lime and green dominate; ink grounds the composition.

Composition: isolated vignette, character and props floating on plain off-white background, no scenery, no floor, no cast shadow beyond a tiny contact shadow. Generous empty space around the figure. Clean silhouette readable at small size. No text, no logos, no brand marks, no watermarks.
```

## 2. Scene line (swap per post)

```
Scene: [one person] [action] with [1–2 props], expressing [emotion/idea of the post].
```

EVO-themed scene ideas (mental wellness / getting unstuck):
- Climbing a giant lime ladder, one oversized hand reaching for the next rung (Unstuck Ladder)
- Sitting cross-legged on a big green beanbag, eyes closed, a glowing lime orb floating above the palms (Calm)
- Walking briskly holding a phone showing a chat bubble shape, other hand waving (Guided chat)
- Pulling a tangled ink-black thread loose into a neat lime line (Untangling thoughts)
- Stacking oversized check-mark blocks into a tower, kneeling (Wins)
- Cutting through ink-black chains around a cloud-shaped weight with lime bolt cutters (Breaking a pattern)
- Watering a small sprout growing from an open notebook (Daily check-in)
- Holding a big umbrella against small ink rain clouds, sun peeking behind (Forecast / mood)
- Opening a drawer full of glowing lime folders labelled with no text (Memory)
- Lying on a beanbag with headphones, sound-wave shapes drifting out (Voice)

## 3. Combined sheet (multiple vignettes in one image)

```
[Master style prompt]
Layout: character sheet of 6 separate vignettes in a 3×2 grid on one off-white canvas, equal spacing, no borders, no overlap between vignettes. Same art style, palette and character proportions in every vignette.
1. [scene] 2. [scene] 3. [scene] 4. [scene] 5. [scene] 6. [scene]
```

Use the same character description in every scene for a consistent mascot, e.g.:
`Recurring character: young adult, short dark wavy hair, oversized lime puffer jacket, ink-black wide trousers, chunky deep-green sneakers with lime soles.`

## 4. Animation-ready variants

For posts that will be animated, add ONE of these to the prompt.

**A. Clean single pose (for After Effects / Rive puppet rigging)**
```
Full-body character in a neutral, open pose with arms and legs clearly separated from the torso, nothing overlapping the body, hands open, feet apart. Flat solid fills, minimal texture inside shapes so parts can be cut out cleanly. Plain flat #F6F8F2 background for easy removal.
```

**B. Body-part sheet (cut-out animation)**
```
Character asset sheet: the same character broken into separate, non-overlapping parts laid out neatly on a plain background: head, hair, torso with jacket, upper arms, forearms, both hands (open and pointing), upper legs, lower legs, both shoes, and each prop. Each part has rounded joint ends for rotation. Same style, palette and scale.
```

**C. Key poses (frame animation / loops)**
```
Pose sheet of 4 key frames of the same character in a row: [start pose], [anticipation], [action], [settle]. Identical proportions, palette and lighting across frames, evenly spaced.
```

**D. Props separately**
```
Prop sheet only, no characters: [list props], each isolated, same style and palette, plain background.
```

## 5. Negative prompt

```
photorealistic, 3D render, gradient mesh, glossy, neon glow, thick black outlines, anime, chibi, realistic proportions, busy background, scenery, text, letters, logos, brand swooshes, watermark, extra fingers, blue as dominant colour, red, purple dominant, pastel washed-out colours
```

## 6. Production notes

- Generate at 2048×2048 (single) or 3072×2048 (sheet); export PNG.
- Remove background, then vectorise (Figma "Vectorize" / Illustrator Image Trace, 6–8 colours) to snap fills back to exact palette hex values.
- In Figma, name layers by body part (`arm-l-upper`, `hand-r`, …) and set pivot points at joints before handing off to animation.
- Keep the grain as a separate overlay layer (noise at 8–12% opacity, multiply) so it can stay static while parts move.
- Good motion defaults: 2–4° idle sway on torso, 6–10° swing on arms, ease `cubic-bezier(0.2, 0, 0, 1)` (matches `--ease-out-evo`).
