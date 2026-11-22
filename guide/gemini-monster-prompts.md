# Gemini prompts — 6 monsters (assembled + separated parts for animation)

Workflow for EACH monster, in ONE chat (so Gemini keeps the same character):
1. Send **Prompt A** → pick the best image.
2. Send **Prompt B** (same chat) → gives the same monster as separate parts on white.
3. Send me both images and I will cut the parts and animate them (idle bob, blink, mouth, arm, attack, hit, defeat).

## Global style (already included in every prompt; keep it identical for all 6 so they look like one family)
Friendly-scary cartoon game art for a kids/youth Christian game, bold dark outline (thick, even), flat colours with soft cel shading and a small highlight, glossy mobile-game style, big expressive eyes, front view, symmetrical pose, no text, no logo.

---

## Prompt B — template (use after Prompt A, fill the parts list from each monster below)
```
Take this exact same character and redraw it as a SEPARATED PARTS SHEET for 2D skeletal animation:
- pure flat white background (#FFFFFF), nothing else, no shadows on the ground, no gradient background
- every part drawn as its own separate piece, NOT touching or overlapping any other piece, with a clear gap (at least 5% of the image) between pieces
- each piece fully drawn including the hidden areas that were behind other parts (e.g. the whole eyeball, the whole arm, the full body behind the head)
- exactly the same art style, colours, outline thickness and lighting as the assembled character
- keep every piece at the same scale it has in the assembled character, front view, neutral pose, mouth closed unless the part is "open mouth"
- arrange the pieces in a tidy grid, square 1:1 image, high resolution
- no text, no numbers, no arrows, no labels
Parts to include: <PARTS LIST>
```

---

## 1) The Liar — وحش الكذب (purple, horns, long nose)
**Prompt A**
```
Cartoon game monster "The Liar": a round purple blob creature with two small dark-purple horns, big shifty bulging eyes with tiny pupils looking sideways, thick angry-sneaky eyebrows, a very long pointed Pinocchio-style nose, a wide sly grin with a dark mouth and a forked pink tongue, little stubby arms and hands, floating "?" and "!?" symbols around it. Friendly-scary cartoon game art for a kids/youth Christian game, bold dark outline, flat colours with soft cel shading and a small glossy highlight, front view, symmetrical pose, centered on a plain white background, no text, no logo, 1:1.
```
**Parts list for Prompt B**
`body (full round purple body, no face), left horn, right horn, left eye white, right eye white, left pupil, right pupil, left eyebrow, right eyebrow, long nose, mouth closed grin, mouth open (dark inside with teeth), forked tongue, left arm with hand, right arm with hand, the "?" symbol, the "!?" symbol`

## 2) The Accuser — وحش الاتهام (red, pointing finger, scroll)
**Prompt A**
```
Cartoon game monster "The Accuser": a stocky red demon with two curved dark-red horns, glowing yellow slit eyes under heavy angry eyebrows, a snarling mouth full of white fangs, one big arm raised with a long pointing finger accusing the viewer, the other hand holding a long paper scroll of accusations. Friendly-scary cartoon game art for a kids/youth Christian game, bold dark outline, flat colours with soft cel shading and a small glossy highlight, front view, centered on a plain white background, no text, no logo, 1:1.
```
**Parts list**
`body (torso and head shape without face), left horn, right horn, left eye, right eye, left pupil, right pupil, left eyebrow, right eyebrow, mouth closed, mouth open with fangs, upper arm (pointing side), forearm with hand and pointing finger, other arm with hand, paper scroll`

## 3) The Fear Phantom — وحش الخوف والانقسام (dark ghost, cracked)
**Prompt A**
```
Cartoon game monster "The Fear Phantom": a tall dark navy-blue ghost with a ragged wavy tattered bottom, a bright white zig-zag crack running through its body (symbol of division), big hollow glowing cyan eyes with tiny dark pupils, a jagged open frightened-scary mouth, a few small glowing blue wisps floating around it. Friendly-scary cartoon game art for a kids/youth Christian game, bold dark outline, flat colours with soft cel shading and a small glossy highlight, front view, symmetrical, centered on a plain white background, no text, no logo, 1:1.
```
**Parts list**
`ghost body (full, with the crack drawn as a separate overlay piece), crack overlay, left eye glow, right eye glow, left pupil, right pupil, mouth closed, mouth open jagged, tattered bottom strip (wavy hem) as a separate piece, three floating wisps (each separate)`

## 4) The Doubt Cyclops — وحش الشك (green, one big eye, fiery darts)
**Prompt A**
```
Cartoon game monster "The Doubt Cyclops": a round green one-eyed creature with two small dark-green horns, ONE huge bloodshot eye in the middle of its face with a dark purple pupil and a white highlight, a heavy worried eyebrow, a small crooked mouth, tiny arms, and three flaming arrows (fiery darts) flying around it. Friendly-scary cartoon game art for a kids/youth Christian game, bold dark outline, flat colours with soft cel shading and a small glossy highlight, front view, centered on a plain white background, no text, no logo, 1:1.
```
**Parts list**
`body (green round body without eye), left horn, right horn, eye white (with red veins), iris and pupil, upper eyelid, lower eyelid, eyebrow, mouth closed, mouth open, left arm with hand, right arm with hand, three flaming arrows (each arrow separate, flame drawn as a separate piece from the shaft)`

## 5) The Storm of Despair — وحش اليأس (grey storm cloud)
**Prompt A**
```
Cartoon game monster "The Storm of Despair": a dark grey storm-cloud creature with a sad frowning face, droopy tired eyes with tears, heavy sad eyebrows, small lightning bolts and rain falling from it, a yellow lightning bolt below. Friendly-scary cartoon game art for a kids/youth Christian game, bold dark outline, flat colours with soft cel shading and a small glossy highlight, front view, symmetrical, centered on a plain white background, no text, no logo, 1:1.
```
**Parts list**
`main cloud body (one big piece, no face), three extra cloud puffs (left, right, top, each separate), left eye white, right eye white, left pupil, right pupil, left sad eyebrow, right sad eyebrow, mouth frown, four tear drops (each separate), yellow lightning bolt, four rain streaks`

## 6) The Great Dragon — التنين العظيم (final boss)
**Prompt A**
```
Cartoon game final boss "The Great Dragon": a big red and black dragon facing the viewer, two long curved ivory horns, glowing yellow slit eyes under angry eyebrows, two nostrils with smoke, a wide open mouth with sharp white fangs and a fire flame inside, spread dark-red bat wings with spikes on both sides, a row of spikes on the head. Friendly-scary cartoon game art for a kids/youth Christian game, bold dark outline, flat colours with soft cel shading and a small glossy highlight, front view, symmetrical, centered on a plain white background, no text, no logo, 1:1.
```
**Parts list**
`head and neck (without lower jaw), lower jaw with fangs, left horn, right horn, left eye, right eye, left pupil, right pupil, left eyebrow, right eyebrow, left nostril smoke puff, right nostril smoke puff, left wing (upper part), left wing (lower membrane part), right wing (upper part), right wing (lower membrane part), chest and body, flame from the mouth (2 flame pieces: outer orange, inner yellow), head spikes`

---

## Tips
- If a part touches another one, say: "Redo it, leave a bigger gap between every piece and keep the white background perfectly flat."
- If Gemini adds a drop shadow or a gradient background, say: "Remove all shadows and the background gradient, pure flat white only."
- If a part is cut off, ask: "Regenerate only the <part name> fully visible."
- Prefer the same chat for A and B; if you start a new chat, attach the assembled image and say "use this as the reference".
- When you have the images, drop them in `guide/monsters/<name>-assembled.png` and `<name>-parts.png` (or send them to me in the chat).
